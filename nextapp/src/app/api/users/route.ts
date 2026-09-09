import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { NextResponse } from "next/server";

// Поиск по игрокам нужен только формам админки (привязка User → Profile).
export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

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
      select: {
        id: true,
        nickname: true,
        avatar: true,
        steamId: true,
        profileId: true,
      },
    });

    return NextResponse.json({ users });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
