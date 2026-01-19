import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nicknameParam = searchParams.get("nickname");

    const users = await prisma.user.findMany({
      where: {
        nickname: {
          contains: nicknameParam || "",
        },
      },
      take: 10,
    });

    return NextResponse.json({ users });
  } catch (e) {}
}
