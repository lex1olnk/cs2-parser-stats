// Форма тела запроса POST /api/users/batch.
//
// Раньше здесь были классы с декораторами class-validator, но ни сам пакет,
// ни class-transformer в зависимостях не значились, а validate() никто не
// вызывал — декораторы были мёртвым кодом, ломавшим сборку типов.
// Валидация входа живёт в самом роуте.

export interface TeamDistribution {
  players: string[];
}

export interface AddParticipantsDto {
  tournamentId: string;
  distribution: Record<string, TeamDistribution>;
}
