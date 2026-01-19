import React, { useState, useEffect, useCallback } from "react";
import { useStore } from "@/store";

interface ParticipantDistribution {
  [teamName: string]: string[];
}

const AddParticipantsForm: React.FC = () => {
  // Селекторы для избежания бесконечных циклов
  const setShowParticipantForm = useStore(
    (state) => state.setShowParticipantForm
  );
  const addParticipants = useStore((state) => state.addParticipants);
  const loading = useStore((state) => state.loading);
  const tournaments = useStore((state) => state.tournaments);
  const showParticipantForm = useStore((state) => state.showParticipantForm);

  const [tournamentId, setTournamentId] = useState<string>("");
  const [participantsText, setParticipantsText] = useState<string>("");
  const [distribution, setDistribution] = useState<ParticipantDistribution>({});
  const [isVisible, setIsVisible] = useState(false);

  // Анимация появления
  useEffect(() => {
    if (showParticipantForm) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [showParticipantForm]);

  // Автоматическое распределение по столбцам
  const distributeParticipants = useCallback(() => {
    if (!participantsText.trim()) {
      setDistribution({});
      return;
    }

    // Разбиваем текст на строки
    const lines = participantsText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      setDistribution({});
      return;
    }

    // Разбиваем каждую строку на имена (разделитель: пробел или таб)
    const teamsData = lines.map((line) =>
      line.split(/[\s\t]+/).filter((name) => name.length > 0)
    );

    // Определяем количество команд по количеству столбцов в первой строке
    const teamCount = teamsData[0]?.length || 0;

    if (teamCount === 0) {
      setDistribution({});
      return;
    }

    // Создаем команды и распределяем игроков по столбцам
    const teams: ParticipantDistribution = {};

    for (let teamIndex = 0; teamIndex < teamCount; teamIndex++) {
      const teamName = `Team ${teamIndex + 1}`;
      teams[teamName] = [];

      // Капитан - первый игрок в столбце
      const captain = teamsData[0]?.[teamIndex];
      if (captain) {
        teams[teamName].push(captain);
      }

      // Остальные игроки в столбце
      for (let rowIndex = 1; rowIndex < teamsData.length; rowIndex++) {
        const player = teamsData[rowIndex]?.[teamIndex];
        if (player) {
          teams[teamName].push(player);
        }
      }
    }

    setDistribution(teams);
  }, [participantsText]);

  // Вызываем распределение только при изменении текста
  useEffect(() => {
    distributeParticipants();
  }, [distributeParticipants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tournamentId || Object.keys(distribution).length === 0) {
      alert("Заполните все обязательные поля");
      return;
    }

    try {
      await addParticipants({
        tournamentId,
        distribution,
      });

      // Сброс формы и закрытие
      setTournamentId("");
      setParticipantsText("");
      setDistribution({});
      setShowParticipantForm(false);
    } catch (error) {
      console.error("Failed to add participants:", error);
      alert("Ошибка при добавлении участников");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setShowParticipantForm(false);
    }, 300);
  }, [setShowParticipantForm]);

  if (!showParticipantForm && !isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          isVisible
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 -translate-y-4 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Добавить участников
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            disabled={loading}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-black"
        >
          {/* Выбор турнира */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Турнир *
            </label>
            <select
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
              disabled={loading}
            >
              <option value="">Выберите турнир</option>
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </div>

          {/* Текстовое поле для участников */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Список участников (по столбцам) *
            </label>
            <textarea
              value={participantsText}
              onChange={(e) => setParticipantsText(e.target.value)}
              placeholder={`Введите имена участников по столбцам. Каждый столбец - команда.
Пример:
Tarskii    sapporo    savvi4    AEL    CK
stusslk    Vorschlaghammer    admiral    juanchoze    Anissa
cora    ayzen    Shellzy    RVL    4rs
Espadaaa    dismemberrr    nyako    ace    oqimori
IIOTAII    yolzeN    touahade    nitr0    hntr

• Первая строка - капитаны команд
• Разделитель: пробел или табуляция
• Количество команд определяется автоматически`}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
              required
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Первая строка - капитаны команд. Разделитель: пробел или табуляция
            </p>
          </div>

          {/* Предпросмотр распределения */}
          {Object.keys(distribution).length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Распределение по командам
                </label>
                <span className="text-sm text-gray-500">
                  Команд: {Object.keys(distribution).length} | Участников:{" "}
                  {Object.values(distribution).flat().length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(distribution).map(([teamName, players]) => (
                  <div
                    key={teamName}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">
                        {teamName}
                      </h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {players.length} игроков
                      </span>
                    </div>
                    <div className="space-y-1">
                      {players.map((player, index) => (
                        <div
                          key={index}
                          className={`text-sm px-2 py-1 rounded border ${
                            index === 0
                              ? "bg-yellow-50 border-yellow-200 text-yellow-800 font-medium"
                              : "bg-white border-gray-200 text-gray-700"
                          }`}
                        >
                          {index === 0 ? "© " : ""}
                          {player}
                          {index === 0 && (
                            <span className="text-xs text-yellow-600 ml-1">
                              (капитан)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="submit"
              disabled={
                loading ||
                !tournamentId ||
                Object.keys(distribution).length === 0
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md transition-all duration-200 font-medium transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              {loading
                ? "Добавление..."
                : `Добавить ${
                    Object.values(distribution).flat().length
                  } участников`}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 py-3 px-4 rounded-md transition-all duration-200 font-medium transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddParticipantsForm;
