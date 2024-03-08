// pages/api/register.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import {  NextApiResponse } from "next";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req:Request, res:NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return new NextResponse("Method not allowed", { status: 405 });
    }
    const body = await req.json();
    const { email, password, name } = body;


    // Check if a user with the same email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "A user with this email already exists." },
        {
          status: 400,
        }
      );
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Handle any other HTTP method
    console.log(error);
  }
}
