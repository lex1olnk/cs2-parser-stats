import { CreateTournamentDto } from "./dto/create-tournament.dto";
import { UpdateTournamentDto } from "./dto/update-tournament.dto";
import { prisma } from "@/lib/prisma";

export class TournamentsService {
  async create(createTournamentDto: CreateTournamentDto) {
    const tournament = await prisma.tournament.create({
      data: createTournamentDto,
    });
    return tournament;
  }

  async findAll() {
    return await prisma.tournament.findMany();
  }

  async findOne(id: number) {
    return `This action returns a #${id} tournament`;
  }

  async update(id: string, updateTournamentDto: UpdateTournamentDto) {
    return await prisma.tournament.update({
      where: {
        id,
      },
      data: updateTournamentDto,
    });
  }

  async remove(id: string) {
    return await prisma.tournament.delete({ where: { id: id } });
  }
}
