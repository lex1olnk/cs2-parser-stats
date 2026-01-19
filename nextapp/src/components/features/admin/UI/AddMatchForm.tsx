import React, { useState, useEffect } from "react";
import type { MatchInput, Tournament } from "@/types";
import { useStore } from "@/store";

// Регулярные выражения для валидации URL
const FASTCUP_URL_REGEX = /https:\/\/cs2\.fastcup\.net\/matches\/\d+/;
const CYBERSHOKE_URL_REGEX = /https:\/\/cybershoke\.net\/\w+\/match\/\d+/;

const AddMatchForm: React.FC = () => {
  const { tournaments, setShowMatchForm, showMatchForm, loading } = useStore();

  const [tournamentId, setTournamentId] = useState<string>("");
  const [matchText, setMatchText] = useState<string>("");
  const [parsedMatches, setParsedMatches] = useState<MatchInput[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Функция для проверки URL
  const isValidMatchUrl = (url: string): boolean => {
    return FASTCUP_URL_REGEX.test(url) || CYBERSHOKE_URL_REGEX.test(url);
  };

  // Функция для определения платформы по URL
  const detectPlatform = (url: string): "fastcup" | "cybershoke" => {
    if (FASTCUP_URL_REGEX.test(url)) return "fastcup";
    if (CYBERSHOKE_URL_REGEX.test(url)) return "cybershoke";
    return "fastcup";
  };

  // Анимация появления/исчезновения
  useEffect(() => {
    if (showMatchForm) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [showMatchForm]);

  // Парсинг текста при изменении matchText ИЛИ tournamentId
  useEffect(() => {
    if (matchText.trim()) {
      const lines = matchText.split("\n").filter((line) => line.trim());

      const validMatches: MatchInput[] = lines
        .map((line) => line.trim())
        .filter((line) => {
          const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
          const url = urlMatch ? urlMatch[0] : line;
          return isValidMatchUrl(url);
        })
        .map((line) => {
          const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
          const url = urlMatch ? urlMatch[0] : line;
          const platform = detectPlatform(url);

          return {
            url: line,
            isFinal: false,
            tournamentId: tournamentId,
            platform: platform,
          };
        });

      setParsedMatches(validMatches);
    } else {
      setParsedMatches([]);
    }
  }, [matchText, tournamentId]);

  // Дополнительный эффект для обновления tournamentId в уже распарсенных матчах
  useEffect(() => {
    if (parsedMatches.length > 0 && tournamentId) {
      setParsedMatches((prev) =>
        prev.map((match) => ({
          ...match,
          tournamentId: tournamentId,
        }))
      );
    }
  }, [tournamentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedMatches.length === 0) {
      alert("Добавьте хотя бы один валидный матч");
      return;
    }

    setIsSubmitted(true);

    const matchData: { matches: MatchInput[] } = {
      matches: parsedMatches,
    };

    console.log("Отправляемые данные:", matchData);

    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(matchData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      console.log("Матчи успешно отправлены на сервер:", result);

      // ✅ УВЕДОМЛЯЕМ MatchManagement о новых сессиях
      if (window.parent && typeof window.parent.postMessage === "function") {
        window.parent.postMessage(
          {
            type: "NEW_SESSIONS_CREATED",
            sessions: result.results,
          },
          "*"
        );
      }

      // Закрываем форму после успешной отправки
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Ошибка при добавлении матчей:", error);
      alert("Ошибка при добавлении матчей");
      setIsSubmitted(false);
    }
  };

  const handleToggleFinal = (index: number) => {
    setParsedMatches((prev) =>
      prev.map((match, i) =>
        i === index ? { ...match, isFinal: !match.isFinal } : match
      )
    );
  };

  const handleTogglePlatform = (index: number) => {
    setParsedMatches((prev) =>
      prev.map((match, i) =>
        i === index
          ? {
              ...match,
              platform: match.platform === "fastcup" ? "cybershoke" : "fastcup",
            }
          : match
      )
    );
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setTournamentId("");
    setMatchText("");
    setParsedMatches([]);
    setIsSubmitted(false);

    setIsVisible(false);
    setTimeout(() => {
      setShowMatchForm(false);
    }, 300);
  };

  const handleResetForm = () => {
    setTournamentId("");
    setMatchText("");
    setParsedMatches([]);
    setIsSubmitted(false);
  };

  // Получаем все строки из текстового поля для анализа
  const allLines = matchText.split("\n").filter((line) => line.trim());
  const invalidLines = allLines.filter((line) => {
    const urlMatch = line.match(/(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[0] : line.trim();
    return !isValidMatchUrl(url);
  });

  if (!showMatchForm && !isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-black/30 text-black flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          isVisible
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 -translate-y-4 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {isSubmitted ? "Матчи отправлены" : "Добавить матчи"}
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
          className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
        >
          {/* Сообщение об успешной отправке */}
          {isSubmitted && (
            <div className="p-4 bg-green-50 rounded-md border border-green-200">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-green-700 font-medium">
                  Матчи успешно отправлены на обработку!
                </p>
              </div>
              <p className="text-sm text-green-600 mt-2">
                Прогресс обработки можно отслеживать на главной странице
              </p>
            </div>
          )}

          {/* Селект турнира */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Турнир (необязательно)
            </label>
            <select
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={loading || isSubmitted}
            >
              <option value="">Обычные матчи (без турнира)</option>
              {tournaments.map((tournament: Tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.name} ({tournament.status})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {tournamentId
                ? `Выбран турнир. Все матчи будут привязаны к этому турниру.`
                : `Если оставить пустым, матчи будут считаться обычными`}
            </p>
          </div>

          {/* Текстовое поле для матчей */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Список матчей *
            </label>
            <textarea
              value={matchText}
              onChange={(e) => setMatchText(e.target.value)}
              placeholder={`Введите матчи, каждый с новой строки. Поддерживаются только:
• https://cs2.fastcup.net/matches/12345678
• https://cybershoke.net/path/match/12345678

Пример:
https://cs2.fastcup.net/matches/19162853 Team A vs Team B
https://cybershoke.net/5x5/match/19162854 Another Match`}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-mono text-sm"
              required
              disabled={loading || isSubmitted}
            />
            <p className="text-sm text-gray-500 mt-1">
              Каждая строка - отдельный матч. Поддерживаются только Fastcup и
              Cybershoke URL
            </p>
          </div>

          {/* Предупреждение о невалидных строках */}
          {invalidLines.length > 0 && (
            <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <div className="flex items-center mb-2">
                <svg
                  className="w-5 h-5 text-yellow-600 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-yellow-700 font-medium">
                  Найдено {invalidLines.length} невалидных строк
                </p>
              </div>
              <p className="text-sm text-yellow-600 mb-2">
                Эти строки не соответствуют формату Fastcup или Cybershoke и не
                будут добавлены:
              </p>
              <div className="max-h-20 overflow-y-auto text-xs font-mono bg-yellow-100 p-2 rounded">
                {invalidLines.map((line, index) => (
                  <div key={index} className="text-yellow-800 py-1">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Предпросмотр распарсенных матчей */}
          {parsedMatches.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Валидные матчи ({parsedMatches.length})
                {tournamentId && (
                  <span className="ml-2 text-green-600">
                    • Привязаны к турниру
                  </span>
                )}
              </label>
              <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                {parsedMatches.map((match, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md border transition-all duration-200 ${
                      match.isFinal
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-white border-gray-200"
                    } ${match.tournamentId ? "border-l-4 border-l-green-500" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 break-words">
                          {match.url}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              match.platform === "fastcup"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {match.platform}
                          </span>
                          {match.tournamentId && (
                            <span className="text-xs text-green-600">
                              Турнир:{" "}
                              {tournaments.find(
                                (t) => t.id === match.tournamentId
                              )?.name || match.tournamentId}
                            </span>
                          )}
                        </div>
                        {match.url.includes("https://") && (
                          <a
                            href={match.url
                              .split(" ")
                              .find((part) => part.startsWith("https://"))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                          >
                            Открыть ссылку
                          </a>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-3">
                        <button
                          type="button"
                          onClick={() => handleToggleFinal(index)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                            match.isFinal
                              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                          disabled={loading || isSubmitted}
                        >
                          {match.isFinal ? "Финальный ✓" : "Сделать финальным"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePlatform(index)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-all duration-200 ${
                            match.platform === "fastcup"
                              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                              : "bg-blue-400 hover:bg-blue-600 text-white"
                          }`}
                          disabled={loading || isSubmitted}
                        >
                          {match.platform}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Статистика */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Всего строк: {allLines.length}</span>
            <span>Валидных матчей: {parsedMatches.length}</span>
            <span className="text-yellow-600">
              Невалидных: {invalidLines.length}
            </span>
            {tournamentId && (
              <span className="text-green-600">
                С турниром: {parsedMatches.filter((m) => m.tournamentId).length}
              </span>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex space-x-3 pt-4 border-t">
            {!isSubmitted ? (
              <>
                <button
                  type="submit"
                  disabled={parsedMatches.length === 0 || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md transition-all duration-200 font-medium transform hover:scale-105 active:scale-95 disabled:transform-none"
                >
                  {loading
                    ? "Отправка..."
                    : `Добавить матчи (${parsedMatches.length})`}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 py-3 px-4 rounded-md transition-all duration-200 font-medium transform hover:scale-105 active:scale-95 disabled:transform-none"
                >
                  Отмена
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-all duration-200 font-medium transform hover:scale-105 active:scale-95"
                >
                  Добавить еще матчи
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-md transition-all duration-200 font-medium transform hover:scale-105 active:scale-95"
                >
                  Закрыть
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMatchForm;
