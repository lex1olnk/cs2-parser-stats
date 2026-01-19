import { prisma } from "@/lib/prisma";
import { writeFileSync } from "node:fs";
import { graphqlMatch } from "./query";
import { MatchInput } from "@/types/demo-processing";

interface FastcupMatchResponse {
  data: {
    match: {
      maps: Array<{
        replays: Array<{
          url: string;
          id: string;
          createdAt: string;
        }>;
      }>;
    };
  };
}
interface FindAllParams {
  where?: { tournamentId?: string; status?: string; type?: string };
  skip?: number;
  take?: number;
  orderBy?: any;
  include?: any;
}
export class MatchesService {
  async findAll(params: FindAllParams = {}) {
    const { where, skip, take, orderBy, include } = params;

    // Базовый запрос
    const query: FindAllParams = {};
    //console.log(params);
    if (where) query.where = where;
    if (skip !== undefined) query.skip = +skip;
    if (take !== undefined) query.take = +take;
    if (orderBy) query.orderBy = orderBy;

    // Если не указан include, добавляем базовые связи
    query.include = include || {
      tournament: {
        select: { id: true, name: true },
      },
      /*
      teams: {
        select: { id: true, name: true, score: true, isWinner: true },
      },
      maps: {
        select: { id: true, number: true, mapId: true, gameStatus: true },
      },*/
    };

    try {
      const matches = await prisma.match.findMany(query);
      return matches;
    } catch (error: any) {
      throw new Error(`Failed to fetch matches: ${error.message}`);
    }
  }

  async count(where?: any) {
    try {
      return await prisma.match.count(where);
    } catch (error: any) {
      throw new Error(`Failed to count matches: ${error.message}`);
    }
  }

  async checkOne(id: string) {
    return await prisma.match.findUnique({
      where: { id },
    });
  }

  async downloadDemoBasedOnPlatform(match: MatchInput, outputPath: string) {
    switch (match.platform) {
      case "fastcup":
        return await this.downloadFastcupDemo(match.url, outputPath);
      /*
      case "cybershoke":
        return await this.downloadCybershokeDemo(match.url, outputPath);
*/
      default:
        throw new Error(`Unsupported platform: ${match.platform}`);
    }
  }

  async downloadFastcupDemo(url: string, outputPath: string) {
    try {
      // Извлекаем matchId из URL лобби Fastcup
      const matchId = this.extractMatchIdFromUrl(url);

      // Получаем данные матча через GraphQL API
      const matchData = await this.fetchFastcupMatchData(matchId);

      // Извлекаем первую доступную ссылку на демо
      const demoUrl = this.extractDemoUrlFromMatchData(matchData);

      if (!demoUrl) {
        throw new Error("No demo URL found in match data");
      }

      // Скачиваем демо файл
      return await this.downloadFile(demoUrl, outputPath);
    } catch (error) {
      return {
        success: false,
        error: `Fastcup download failed: ${error}`,
      };
    }
  }
  /*
  async downloadCybershokeDemo(url: string, outputPath: string) {
    // Аналогичная логика для Cybershoke
    // но с их специфическим API/структурой URL

    const demoUrl = await extractCybershokeDemoUrl(url);
    return await this.downloadFile(demoUrl, outputPath);
  }*/

  async downloadFile(url: string, outputPath: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    await writeFileSync(outputPath, Buffer.from(buffer));

    return { success: true };
  }

  async fetchFastcupMatchData(matchId: number) {
    const graphqlQuery = {
      query: graphqlMatch,
      variables: {
        matchId: matchId,
        gameId: 3, // CS:GO/CS2
      },
    };

    const response = await fetch("https://hasura.fastcup.net/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Возможно потребуются дополнительные headers
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.data?.match?.maps) {
      throw new Error("Invalid match data structure");
    }

    return data;
  }

  extractMatchIdFromUrl(url: string): number {
    // Пример URL: https://fastcup.net/csgo/lobbies/123456
    // или: https://fastcup.net/csgo/matches/123456
    const match = url.match(/\/(lobbies|matches)\/(\d+)/);
    if (!match) {
      throw new Error("Invalid Fastcup URL format");
    }
    return parseInt(match[2]);
  }

  extractDemoUrlFromMatchData(matchData: FastcupMatchResponse): string | null {
    for (const map of matchData.data.match.maps) {
      if (map.replays && map.replays.length > 0) {
        // Берем первую доступную демку
        return map.replays[0].url;
      }
    }
    return null;
  }
}
