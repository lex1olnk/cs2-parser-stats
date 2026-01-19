import { AddParticipantsDto } from "@/lib/server-parse-services/dto/add-participants.dto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ParticipantResponseDto,
  TeamResponseDto,
} from "@/lib/server-parse-services/dto/participant-response.dto";
export async function POST(request: NextRequest) {
  try {
    const { tournamentId, distribution }: AddParticipantsDto =
      await request.json();

    // Проверяем существование турнира
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new Error(`Tournament with ID ${tournamentId} not found`);
    }

    // Собираем все уникальные имена участников
    const allPlayerNames = Object.values(distribution).flatMap(
      (team) => team.players
    );
    const uniquePlayerNames = [...new Set(allPlayerNames)];

    // Находим или создаем профили
    const profileMap = await findOrCreateProfiles(uniquePlayerNames);

    // Создаем команды и участников
    const teams = await createTeamsAndParticipants(
      tournamentId,
      distribution,
      profileMap
    );

    const totalParticipants = teams.reduce(
      (sum, team) => sum + team.participants.length,
      0
    );

    return NextResponse.json({
      message: "Participants added successfully",
      teams,
      totalParticipants,
      totalTeams: teams.length,
    });
  } catch (e) {
    console.error(e);
  }
}

async function findOrCreateProfiles(
  playerNames: string[]
): Promise<Map<string, number>> {
  const profileMap = new Map<string, number>();

  // Ищем существующие профили
  const existingProfiles = await prisma.profile.findMany({
    where: {
      name: {
        in: playerNames,
      },
    },
  });

  // Заполняем карту существующими профилями
  existingProfiles.forEach((profile) => {
    profileMap.set(profile.name, profile.id);
  });

  // Создаем недостающие профили
  const missingNames = playerNames.filter((name) => !profileMap.has(name));

  for (const name of missingNames) {
    try {
      const newProfile = await prisma.profile.create({
        data: {
          name,
        },
      });
      profileMap.set(name, newProfile.id);
    } catch (error: any) {
      // Если произошла ошибка уникальности (параллельное создание)
      if (error.code === "P2002") {
        const existingProfile = await prisma.profile.findUnique({
          where: { name },
        });
        if (existingProfile) {
          profileMap.set(name, existingProfile.id);
        }
      } else {
        throw error;
      }
    }
  }

  return profileMap;
}

async function createTeamsAndParticipants(
  tournamentId: string,
  distribution: Record<string, { players: string[] }>,
  profileMap: Map<string, number>
): Promise<TeamResponseDto[]> {
  const result: TeamResponseDto[] = [];

  // Обрабатываем каждую команду
  for (const [teamName, teamData] of Object.entries(distribution)) {
    const { players } = teamData;

    if (players.length === 0) {
      continue;
    }

    // Проверяем, что капитан существует
    const captainName = players[0];
    const captainId = profileMap.get(captainName);

    if (!captainId) {
      throw new Error(`Captain profile not found: ${captainName}`);
    }

    // Создаем команду
    const team = await prisma.tournamentTeam.create({
      data: {
        name: teamName,
        tournamentId,
        captainId,
        seed: null, // Можно добавить логику для seed
      },
    });

    // Добавляем участников в команду
    const teamParticipants: ParticipantResponseDto[] = [];

    for (const [index, playerName] of players.entries()) {
      const profileId = profileMap.get(playerName);

      if (!profileId) {
        console.warn(`Profile not found for player: ${playerName}`);
        continue;
      }

      try {
        // Проверяем, не участвует ли уже этот профиль в турнире
        const existingParticipant =
          await prisma.tournamentParticipant.findFirst({
            where: {
              profileId,
              tournamentId,
            },
          });

        if (existingParticipant) {
          // Если участник уже есть, обновляем его команду
          const participant = await prisma.tournamentParticipant.update({
            where: { id: existingParticipant.id },
            data: {
              tournamentTeamId: team.id,
              draftOrder: index + 1,
            },
            include: {
              profile: true,
            },
          });

          teamParticipants.push({
            id: participant.id,
            profileId: participant.profileId,
            profileName: participant.profile.name,
            draftOrder: participant.draftOrder,
          });
        } else {
          // Создаем нового участника
          const participant = await prisma.tournamentParticipant.create({
            data: {
              profileId,
              tournamentId,
              tournamentTeamId: team.id,
              draftOrder: index + 1,
            },
            include: {
              profile: true,
            },
          });

          teamParticipants.push({
            id: participant.id,
            profileId: participant.profileId,
            profileName: participant.profile.name,
            draftOrder: participant.draftOrder,
          });
        }
      } catch (error: any) {
        if (error.code === "P2002") {
          // Unique constraint violation - участник уже существует в этом турнире
          throw new Error(
            `Participant ${playerName} is already registered in this tournament`
          );
        }
        throw error;
      }
    }

    result.push({
      id: team.id,
      captainId: team.captainId,
      participants: teamParticipants,
    });
  }

  return result;
}
