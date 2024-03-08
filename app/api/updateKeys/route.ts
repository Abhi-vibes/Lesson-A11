// pages/api/updateKeys.ts
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { NextApiResponse } from "next";

export async function POST(req: Request, res: NextApiResponse) {
  try {
    const body = await req.json();
    const { apiKey, assistantKey } = body;

    console.log(apiKey, assistantKey);

    const envFile = path.join(process.cwd(), ".env");
    const envVars: Record<string, string> = fs
      .readFileSync(envFile, "utf8")
      .split("\n")
      .reduce((obj: Record<string, string>, line: string) => {
        const [key, value] = line.split("=");
        obj[key] = value;
        return obj;
      }, {});

    // Update the keys
    envVars["NEXT_PUBLIC_API_KEY"] = apiKey;
    envVars["NEXT_PUBLIC_ASSISTANT_KEY"] = assistantKey;

    // Write the updated contents back to the .env file
    const updatedEnvVars = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");
    await fs.promises.writeFile(envFile, updatedEnvVars);

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    return new NextResponse("Method not allowed", { status: 405 });
  }
}
