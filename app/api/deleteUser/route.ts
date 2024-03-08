// pages/api/deleteUser.js
import { PrismaClient } from "@prisma/client";
import { NextApiResponse } from "next";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request, res: NextApiResponse) {
  const body = await req.json();
  const { id } = body;

  console.log(id);

  if (req.method === "POST") {
    try {
      const user = await prisma.user.delete({
        where: {
          id: id,
        },
      });
      return NextResponse.json(
        { message: "User deleted successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { message: "Error deleting user" },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { message: "Method not allowed" },
      { status: 405 }
    );
  }
}
