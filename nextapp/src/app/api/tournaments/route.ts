import { CreateTournamentDto } from "@/services/server/server-parse-services/dto/create-tournament.dto";
import { TournamentsService } from "@/services/server/server-parse-services/tournaments.service";
import { requireAdmin } from "@/lib/auth/guards";
import { NextRequest, NextResponse } from "next/server";

const tournamentsService: TournamentsService = new TournamentsService();

export async function GET() {
  try {
    const matches = await tournamentsService.findAll();
    return NextResponse.json(matches);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    // Получаем данные из тела запроса
    const body: CreateTournamentDto = await request.json();

    // Валидация данных
    if (!body.name || !body.status) {
      return NextResponse.json(
        { error: "Name and status are required" },
        { status: 400 },
      );
    }

    // Здесь обычно происходит сохранение в базу данных
    const tournament = await tournamentsService.create(body);

    // Имитация создания турнира

    return NextResponse.json(
      {
        message: "Tournament created successfully",
        tournament: tournament,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating tournament:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
