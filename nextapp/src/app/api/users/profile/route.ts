import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    // Параметры пагинации
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Параметры сортировки
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          users: true,
        },
      }),
      prisma.profile.count({}),
    ]);
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      data: profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null,
      },
    });
  } catch (e) {
    console.error(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Получаем данные из тела запроса
    const body: { name: string }[] = await request.json();

    // Валидация данных
    if (!body) {
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
    }

    // Здесь обычно происходит сохранение в базу данных
    const profileResult = await prisma.profile.createMany({
      data: body,
    });

    // Имитация создания турнира

    return NextResponse.json(
      {
        message: "Profiles created successfully",
        profiles: profileResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tournament:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
