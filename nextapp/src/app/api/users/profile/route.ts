import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

// Профили заводятся и просматриваются только из админки.
const SORTABLE_FIELDS = ["id", "name"] as const;

function parseOrderBy(sortBy: string | null, sortOrder: string | null) {
  const field = SORTABLE_FIELDS.includes(sortBy as never)
    ? (sortBy as (typeof SORTABLE_FIELDS)[number])
    : "id";
  const direction = sortOrder === "desc" ? "desc" : "asc";

  return { [field]: direction };
}

export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10")),
    );
    const skip = (page - 1) * limit;

    const orderBy = parseOrderBy(
      searchParams.get("sortBy"),
      searchParams.get("sortOrder"),
    );

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        skip,
        take: limit,
        orderBy,
        include: {
          users: { select: { id: true, nickname: true, steamId: true } },
          _count: { select: { users: true } },
        },
      }),
      prisma.profile.count({}),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      data: profiles.map(({ _count, ...profile }) => ({
        ...profile,
        userCount: _count.users,
        isLinkedToUsers: _count.users > 0,
      })),
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const body = await request.json();

    // Клиент шлёт { data: [...] }; голый массив тоже принимаем.
    const incoming: unknown = Array.isArray(body) ? body : body?.data;

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return NextResponse.json(
        { error: "Expected a non-empty array of profiles" },
        { status: 400 },
      );
    }

    // В схеме у профиля есть только name — остальные поля запроса игнорируем,
    // иначе createMany падает на неизвестной колонке.
    const names = incoming
      .map((profile: { name?: unknown }) =>
        typeof profile?.name === "string" ? profile.name.trim() : "",
      )
      .filter((name) => name.length > 0);

    if (names.length === 0) {
      return NextResponse.json(
        { error: "Each profile requires a non-empty name" },
        { status: 400 },
      );
    }

    const profileResult = await prisma.profile.createMany({
      data: names.map((name) => ({ name })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: "Profiles created successfully",
        profiles: profileResult,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
