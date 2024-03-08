import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { signIn } from "next-auth/react";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return new NextResponse("Method not allowed", { status: 405 });
    }
    const body = await req.json();

    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new NextResponse("User not found", {
        status: 404,
      });
    }

    if (!user.password) {
      return new NextResponse("Password not set for the user", {
        status: 401,
      });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return new NextResponse("Invalid password", {
        status: 401,
      });
    }

    // Use NextAuth.js to sign in the user
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    console.log(result);

    if (!result || result.error) {
      return new NextResponse("Login failed", { status: 401 });
    }

    return new NextResponse("Logged in successfully", {
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
