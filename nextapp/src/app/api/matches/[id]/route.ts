// Один матч: посмотреть и удалить.
//
// Удаление нужно не только чтобы убрать мусор. Демка привязана к матчу
// уникальным demoPath, поэтому повторно залить тот же файл нельзя — а
// переимпорт единственный способ пересчитать матч по исправленному парсеру.
// Матчи, залитые до появления модели swing, живут без него именно поэтому.
//
// Кнопка «удалить» в админке звала этот адрес и раньше, но роута не было:
// запрос уходил в никуда и возвращал 404, а матч оставался на месте.

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { refreshStatsViews } from "@/services/server/server-parse-services/stats-refresh-service";

export const dynamic = "force-dynamic";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      tournament: true,
      teams: { include: { members: true } },
      maps: { include: { map: true } },
      _count: { select: { rounds: true, kills: true } },
    },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  return NextResponse.json(match);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Удаление матча стирает и всю производную статистику по нему —
  // только для админов.
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const match = await prisma.match.findUnique({
    where: { id },
    select: { id: true, demoPath: true },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  try {
    // Порядок важен: внешние ключи каскад не настроен почти нигде, поэтому
    // сначала уходят таблицы, которые ссылаются на другие, и только потом
    // сам матч. Всё одной транзакцией — половина удалённого матча хуже,
    // чем целый.
    const removed = await prisma.$transaction(async (tx) => {
      const inventories = await tx.matchInventory.deleteMany({
        where: { round: { matchId: id } },
      });
      const stats = await tx.matchTeamMapStat.deleteMany({
        where: { matchMap: { matchId: id } },
      });
      const kills = await tx.matchKill.deleteMany({ where: { matchId: id } });
      const damages = await tx.matchDamage.deleteMany({
        where: { matchId: id },
      });
      const clutches = await tx.matchClutch.deleteMany({
        where: { matchId: id },
      });
      const grenades = await tx.matchGrenade.deleteMany({
        where: { matchId: id },
      });
      const blinds = await tx.matchBlind.deleteMany({ where: { matchId: id } });
      const economies = await tx.matchPlayerEconomy.deleteMany({
        where: { matchId: id },
      });
      const members = await tx.matchMember.deleteMany({
        where: { matchId: id },
      });
      const rounds = await tx.round.deleteMany({ where: { matchId: id } });
      const maps = await tx.matchMap.deleteMany({ where: { matchId: id } });
      const teams = await tx.matchTeam.deleteMany({ where: { matchId: id } });
      await tx.match.delete({ where: { id } });

      return {
        rounds: rounds.count,
        kills: kills.count,
        damages: damages.count,
        clutches: clutches.count,
        grenades: grenades.count,
        blinds: blinds.count,
        economies: economies.count,
        inventories: inventories.count,
        members: members.count,
        teams: teams.count,
        maps: maps.count,
        teamMapStats: stats.count,
      };
    },
    // У матча на 36 раундов уходит порядка десяти тысяч строк урона;
    // в пять секунд по умолчанию такая транзакция не укладывается.
    { timeout: 120_000, maxWait: 15_000 });

    // Вьюшки считают статистику по матчам — без пересчёта удалённый матч
    // остался бы в рейтингах.
    await refreshStatsViews();

    return NextResponse.json({
      deleted: true,
      matchId: id,
      demoPath: match.demoPath,
      removed,
    });
  } catch (error) {
    console.error(`Failed to delete match ${id}:`, error);

    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 },
    );
  }
}
