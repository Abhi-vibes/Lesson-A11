"use client";
import dynamic from "next/dynamic";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

import { chat } from "@/actions/chat";
import Submit from "@/components/submit";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { generateRandomId } from "@/lib/utils";
import { JSONMessage } from "@/types";
import { useRouter } from "next/navigation";
import { ElementRef, useEffect, useOptimistic, useRef } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";
import pptxgen from "pptxgenjs";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";

type ChatProps = {
  messages: JSONMessage[];
  id: string;
};

export default function Chat({ messages, id }: ChatProps) {
  const scrollRef = useRef<ElementRef<"div">>(null);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: string) => [
      ...state,
      {
        answer: undefined,
        id: generateRandomId(4),
        question: newMessage,
      },
    ]
  );

  console.log(optimisticMessages);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [optimisticMessages]);

  async function handleDownload(answer: string | undefined, question: string) {
    const doc = new jsPDF();

    const questionLines = doc.splitTextToSize(question, 180); // Adjust the width as needed
    const answerLines = answer ? doc.splitTextToSize(answer, 180) : []; // Adjust the width as needed

    doc.text(questionLines, 10, 10);
    doc.text(answerLines, 10, 20);
    doc.save("message.pdf");
  }
  function downloadPPT(answer: string | undefined) {
    try {
        const pptx = new pptxgen();

        if (!answer) return; // Skip if there's no answer

        const slideContent = answer.split(/#### Slide|### Slide/); // Split answer into individual slides

        slideContent.forEach((content, contentIndex) => {
            if (contentIndex === 0) return; // Skip the first element as it's empty

            const lines = content.split("\n");
            let slideTitle = "Slide " + lines[0]; // Add "Slide " prefix to title
            let slideBody: {
                text: string;
                options?: { bold: boolean; bullet?: boolean };
            }[] = [];

            let isBulletPoints = false;

            lines.slice(1).forEach((line) => {
                if (
                    line.startsWith("- **Bullet Points**:") ||
                    line.startsWith("- **Detailed Notes**") ||
                    line.startsWith("Would you like") ||
                    line.startsWith("Please respond")
                ) {
                    return; // Skip the "Bullet Points", "Detailed Notes", and specific lines
                }

                if (line.startsWith("- ")) {
                    isBulletPoints = true;
                    line = line.replace("- ", ""); // Remove "-" from the line
                } else {
                    isBulletPoints = false;
                }

                if (isBulletPoints && line.startsWith(":")) {
                    return; // Skip the line with ":"
                }

                // Split the line into segments based on "**"
                const segments = line.split("**");

                // Process each segment
                for (let i = 0; i < segments.length; i++) {
                    // If the segment is not empty, add it as a separate text element
                    if (segments[i].trim() !== "") {
                        slideBody.push({
                            text: segments[i].trim(), // Remove leading and trailing spaces
                            options: { bullet: isBulletPoints, bold: i % 2 === 1 },
                        });
                    }
                }
            });

            const slide = pptx.addSlide({ masterName: "BLANK" }); // Use a blank slide master
            slide.addText([{ text: slideTitle, options: { bold: true } }], {
                x: 0.5,
                y: 0.5,
                fontSize: 24,
            }); // Add title as a separate text element
            slide.addText(slideBody, { x: 0.5, y: 2.5, fontSize: 14 }); // Add body as a separate text element
        });

        pptx.writeFile({ fileName: "chat-history.pptx" });
    } catch (error) {
        console.error("Error generating PowerPoint presentation:", error);
    }
}


  return (
    <div className="grow">
      <div className="flex flex-col items-start gap-12 pb-10 min-h-[75vh] sm:w-[95%]">
        {optimisticMessages.map((message) => (
          <div className="flex flex-col items-start gap-4 " key={message.id}>
            <div className="grid grid-cols-2">
              <h4 className="border border-gray p-2 dark:border-white text-xl font-medium dark:text-sky-200 text-sky-700 mr-2">
                {message.question}
              </h4>
              {!message.answer ? (
                <div className="w-96 flex flex-col gap-3">
                  <Skeleton className="w-[90%] h-[20px] rounded-md" />
                  <Skeleton className="w-[60%] h-[20px] rounded-md" />
                </div>
              ) : (
                <div className="border border-gray p-2 dark:border-white dark:text-slate-300 text-slate-900 whitespace-pre-wrap">
                  <ReactMarkdown>{message.answer}</ReactMarkdown>
                  {/* <Button
                    onClick={() =>
                      handleDownload(message.answer, message.question)
                    }
                    variant="outline"
                    className="mt-4 float-right bg-gray-500"
                  >
                    <DownloadIcon className=" w-6 h-6" />
                  </Button> */}
                  <Button
                    onClick={() => downloadPPT(message.answer)}
                    variant="outline"
                    className="w-full"
                  >
                    <DownloadIcon className="w-6 h-6 mr-2" />
                    Download PPT
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* <Button
        onClick={() => downloadPPT(messages)}
        variant="outline"
        className="w-full"
      >
        <DownloadIcon className="w-6 h-6 mr-2" />
        Download PPT
      </Button> */}
      <div ref={scrollRef}></div>
      <div className="mt-5 bottom-0 sticky pb-8 pt-1 bg-background mr-10">
        <div className="grid grid-cols-2">
          <ChatInput
            id={id}
            addMessage={addOptimisticMessage}
            messages={optimisticMessages}
          />
        </div>
      </div>
    </div>
  );
}

type ConversationComponent = {
  id: string;
  addMessage: (msg: string) => void;
  messages: JSONMessage[];
};

function ChatInput({ addMessage, id, messages }: ConversationComponent) {
  const inputRef = useRef<ElementRef<"input">>(null);
  const router = useRouter();
  const { toast } = useToast();

  async function handleSubmit(formData: FormData) {
    const message = formData.get("message") as string;
    if (!message) return;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (!apiKey) {
      toast({
        title: "No API key found!",
      });
      return;
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    addMessage(message);
    const err = await chat({
      apiKey,
      conversationId: id,
      message,
    });

    if (err?.message) {
      toast({
        title: err.message,
      });
    }
  }

  // function downloadPPT(messages) {
  //   const pres = new pptxgen();

  //   // Iterate over each message
  //   messages.forEach((message, index) => {
  //     // Create a new slide for each message
  //     const slide = pres.addSlide();

  //     // Add title to the slide
  //     slide.addText(message.title, {
  //       x: 0.5,
  //       y: 0.5,
  //       fontSize: 24,
  //       bold: true,
  //     });

  //     // Add bullet points to the slide
  //     slide.addText(message.bulletPoints, {
  //       x: 0.5,
  //       y: 1.5,
  //       fontSize: 14,
  //       bullet: true,
  //     });

  //     // If detailed content exists, add it to the slide
  //     if (message.detailedContent) {
  //       slide.addText(message.detailedContent, { x: 0.5, y: 3, fontSize: 14 });
  //     }
  //   });

  //   // Save the PowerPoint file
  //   pres.writeFile({ fileName: "chat-history.pptx" });
  // }

  function downloadPDF(messages: JSONMessage[]) {
    const doc = new jsPDF();
    let y = 10; // Initialize y-coordinate

    messages.forEach((message, index) => {
      const question = `Question ${index + 1}: ${message.question}`;
      const answer = message.answer
        ? `Answer ${index + 1}: ${message.answer}`
        : "";

      // Split question and answer into lines
      const questionLines = doc.splitTextToSize(question, 180);
      const answerLines = doc.splitTextToSize(answer, 180);

      // Combine question and answer lines
      const lines = [...questionLines, ...answerLines];

      // Add lines to the PDF
      lines.forEach((line) => {
        // If the current page is full, add a new page
        if (y > 280) {
          doc.addPage();
          y = 10; // Reset y-coordinate for the new page
        }

        doc.text(line, 10, y);
        y += 10; // Increase y-coordinate for the next line
      });

      y += 10; // Add extra space between different messages
    });

    doc.save("chat-history.pdf");
  }

  function downloadWord(messages: JSONMessage[]) {
    const doc = createChatDocument(messages);

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "chat-history.docx");
      console.log("Document created successfully");
    });
  }

  function createChatDocument(
    messages: { question: string; answer?: string }[]
  ): Document {
    const paragraphs: Paragraph[] = [
      new Paragraph({
        text: "Chat History",
        heading: HeadingLevel.TITLE,
      }),
      ...messages.flatMap((message) => {
        const questionParagraph = new Paragraph({
          text: `Question: ${message.question}`,
          heading: HeadingLevel.HEADING_2,
        });

        if (message.answer) {
          const answerParagraph = new Paragraph({
            text: `Answer: ${message.answer}`,
          });

          return [questionParagraph, answerParagraph];
        }

        return questionParagraph;
      }),
    ];

    return new Document({
      sections: [
        {
          children: paragraphs,
        },
      ],
    });
  }

  function handleExport(format: string) {
    switch (format) {
      case "pdf":
        downloadPDF(messages);
        break;
      case "word":
        downloadWord(messages);
        break;
      default:
        break;
    }
  }

  return (
    <>
      <form
        action={handleSubmit}
        className="flex flex-row items-center gap-2 sm:pr-5"
      >
        <Input
          ref={inputRef}
          autoComplete="off"
          name="message"
          placeholder="Ask me something..."
          className="h-12"
        />
        <Submit />
      </form>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Download History" />
        </SelectTrigger>
        <SelectContent onChange={(value: any) => handleExport(value)}>
          {/* <Button
            variant="outline"
            className="w-full"
            onClick={() => downloadPPT(messages)}
          >
            Download PPT
          </Button> */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => downloadPDF(messages)}
          >
            Download PDF
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => downloadWord(messages)}
          >
            Download WORD
          </Button>
        </SelectContent>
      </Select>
    </>
  );
}
