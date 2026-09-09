import React, { useCallback, useEffect, useState } from "react";

interface LocalDemo {
  fileName: string;
  sizeMb: number;
  modifiedAt: string;
  imported: boolean;
}

interface Tournament {
  id: string;
  name: string;
}

interface Props {
  tournaments: Tournament[];
  onImportStarted: () => void;
}

export const LocalDemoImport: React.FC<Props> = ({
  tournaments,
  onImportStarted,
}) => {
  const [demos, setDemos] = useState<LocalDemo[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tournamentId, setTournamentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const loadDemos = useCallback(async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/matches/local");
      if (!response.ok) throw new Error(`Ошибка ${response.status}`);

      const data = await response.json();
      setDemos(data.demos ?? []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Не удалось получить список",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (expanded) loadDemos();
  }, [expanded, loadDemos]);

  const toggle = (fileName: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(fileName)) next.delete(fileName);
      else next.add(fileName);
      return next;
    });
  };

  const selectAllNew = () => {
    setSelected(new Set(demos.filter((d) => !d.imported).map((d) => d.fileName)));
  };

  const handleImport = async () => {
    if (selected.size === 0) return;

    setImporting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/matches/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: tournamentId || undefined,
          files: [...selected].map((fileName) => ({ fileName })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Ошибка ${response.status}`);
      }

      setMessage(
        `Импорт запущен: ${data.processing ?? 0} файлов, пропущено ${data.skipped ?? 0}`,
      );
      setSelected(new Set());
      onImportStarted();
      loadDemos();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ошибка импорта");
    } finally {
      setImporting(false);
    }
  };

  const newCount = demos.filter((d) => !d.imported).length;

  return (
    <div className="mb-6 bg-white rounded-lg shadow">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <span className="text-lg font-semibold text-gray-800">
          Импорт демок из папки
          <span className="ml-2 text-sm font-normal text-gray-500">
            shared-demos
          </span>
        </span>
        <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <select
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              disabled={importing}
            >
              <option value="">Без турнира</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <button
              onClick={selectAllNew}
              disabled={importing || newCount === 0}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Выбрать новые ({newCount})
            </button>

            <button
              onClick={loadDemos}
              disabled={loading || importing}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Обновить список
            </button>

            <button
              onClick={handleImport}
              disabled={importing || selected.size === 0}
              className="ml-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm transition"
            >
              {importing
                ? "Запуск..."
                : `Импортировать (${selected.size})`}
            </button>
          </div>

          {message && (
            <div className="mb-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded px-3 py-2">
              {message}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-gray-500 py-4">Читаем папку...</p>
          ) : demos.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">
              В папке <code>shared-demos</code> нет файлов .dem/.zip/.rar.
              Положи демки туда и обнови список.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {demos.map((demo) => (
                <label
                  key={demo.fileName}
                  className={`flex items-center gap-3 py-2 px-1 text-sm ${
                    demo.imported ? "opacity-50" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(demo.fileName)}
                    onChange={() => toggle(demo.fileName)}
                    disabled={demo.imported || importing}
                  />
                  <span className="flex-1 font-mono text-gray-800 truncate">
                    {demo.fileName}
                  </span>
                  <span className="text-gray-500 whitespace-nowrap">
                    {demo.sizeMb} МБ
                  </span>
                  <span className="text-gray-400 whitespace-nowrap">
                    {new Date(demo.modifiedAt).toLocaleString("ru-RU")}
                  </span>
                  {demo.imported && (
                    <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full whitespace-nowrap">
                      импортирован
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}

          <p className="mt-3 text-xs text-gray-500">
            Файлы остаются на диске после импорта — приложение удаляет только то,
            что скачало само.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocalDemoImport;
