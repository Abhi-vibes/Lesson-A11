"use server";

import { getUser } from "@/lib/auth";
import { generateRandomId } from "@/lib/utils";
import prisma from "@/prisma/client";
import { JsonMessagesArraySchema } from "@/types";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import OpenAI from "openai";
import { threadId } from "worker_threads";
import { string } from "zod";

export type Message = {
  message: string;
  apiKey: string;
  conversationId: string;
};

export type NewMessage = Omit<Message, "conversationId">;

export async function newChat(params: NewMessage) {
  const session = await getUser();
  if (!session?.user) redirect("/login");
  let id: string | undefined;
  let error: undefined | { message: string };
  try {
    
    const newConversationId = generateRandomId(8); 
    const responseMessage = await createCompletion(
      params.apiKey,
      params.message,
      newConversationId
    ); 
    const newMessageJson = [
      {
        id: newConversationId,
        question: params.message,
        answer: responseMessage,
      },
    ];
    const dataRef = await prisma.conversation.create({
      data: {
        messages: newMessageJson,
        name: params.message,
        userId: session.user.id,
      },
    });
    id = dataRef.id;
  } catch (err) {
    if (err instanceof Error) error = { message: err.message };
  }
  

  if (error) return error;
  redirect(`/chat/${id}`);
}

export async function chat(params: Message) {
  let error: undefined | { message: string };
  try {
    const responseMessage = await createCompletion(
      params.apiKey,
      params.message,
      params.conversationId
    );
    const newConversationId = generateRandomId(8);
    const dataRef = await prisma.conversation.findUnique({
      where: {
        id: params.conversationId,
      },
    });
    const updatedMessageJson = [
      ...JsonMessagesArraySchema.parse(dataRef?.messages),
      {
        id: newConversationId,
        question: params.message,
        answer: responseMessage,
      },
    ];
    await prisma.conversation.update({
      where: {
        id: params.conversationId,
      },
      data: {
        messages: updatedMessageJson,
      },
    });
  } catch (err) {
    if (err instanceof Error) error = { message: err.message };
  }

  if (error) return error;
  revalidatePath(`/chat/${params.conversationId}`);
}

declare global {
  var ai_map: undefined | Map<string, OpenAI>;
}

const map = globalThis.ai_map ?? new Map<string, OpenAI>();

declare global {
  var conversationThreadMap: Map<string, string>;
}

const conversationThreadMap = globalThis.conversationThreadMap ?? new Map<string, string>();

async function createCompletion(apiKey: string, message: string, conversationId: string) {
  let ai: OpenAI;

  if (map.has(apiKey)) {
    ai = map.get(apiKey)!;
  } else {
    ai = new OpenAI({
      apiKey,
    });
    map.set(apiKey, ai);
  }

  let threadId: string;

  // Check if a thread ID exists for this conversation
  if (conversationThreadMap.has(conversationId)) {
    threadId = conversationThreadMap.get(conversationId)!;
  } else {
    // If not, create a new thread
    const threadResponse = await ai.beta.threads.create();
    threadId = threadResponse.id;
    conversationThreadMap.set(conversationId, threadId);
  }

  // Add a Message to the Thread
  await ai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });

  // Run the Assistant
  const runResponse = await ai.beta.threads.runs.create(threadId, {
    assistant_id: process.env.NEXT_PUBLIC_ASSISTANT_KEY!,
  });

  // Check the Run status
  let run = await ai.beta.threads.runs.retrieve(threadId, runResponse.id);
  while (run.status !== "completed") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    run = await ai.beta.threads.runs.retrieve(threadId, runResponse.id);
  }
  
  // Display the Assistant's Response
  const messagesResponse = await ai.beta.threads.messages.list(threadId, {
    order: 'desc',
    limit: 1
    });

  const assistantResponses = messagesResponse.data.filter((msg) => msg.role === 'assistant');
  const response = assistantResponses.map((msg) =>
  msg.content
    .filter((contentItem) => contentItem.type === 'text')
    .map((textContent) => {
      // Type guard to narrow down the type to MessageContentText
      if (textContent.type === 'text') {
        return textContent.text.value;
      } else {
        // Handle the case where contentItem is not of type MessageContentText
        return ''; // Or handle it according to your application logic
      }
    })
    .join('\n')
).join('\n');

return response;
}
