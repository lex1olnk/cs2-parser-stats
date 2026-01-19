import { CreateTournamentDto } from "@/lib/server-parse-services/dto/create-tournament.dto";
import { MatchesService } from "@/lib/server-parse-services/matchesService";
import { TournamentsService } from "@/lib/server-parse-services/tournaments.service";
import { NextRequest, NextResponse } from "next/server";

const tournamentsService: TournamentsService = new TournamentsService();

export async function GET() {
  try {
    const matches = await tournamentsService.findAll();
    return NextResponse.json(matches);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Получаем данные из тела запроса
    const body: CreateTournamentDto = await request.json();

    // Валидация данных
    if (!body.name || !body.status) {
      return NextResponse.json(
        { error: "Name and status are required" },
        { status: 400 }
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
