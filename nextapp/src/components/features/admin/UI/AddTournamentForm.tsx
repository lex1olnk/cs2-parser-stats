import React, { useState, useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useStore } from "@/store";

const AddTournamentForm: React.FC = () => {
  const { addTournament } = useStore(
    useShallow((state) => ({
      addTournament: state.addTournament,
    }))
  );
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const { showTournamentForm, setShowTournamentForm } = useStore();

  const [formData, setFormData] = useState({
    name: "",
    status: "upcoming" as "upcoming" | "ongoing" | "completed",
    mvpId: undefined as number | undefined,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showTournamentForm) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [showTournamentForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await addTournament(formData);
      // Сброс формы после успешного создания
      setFormData({
        name: "",
        status: "upcoming",
        mvpId: undefined,
      });
    } catch (err) {
      // Ошибка уже обработана в store
      console.error("Form submission error:", err);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowTournamentForm(false);
    }, 300);
  };

  if (!showTournamentForm && !isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-black/20 text-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg max-w-md w-full p-6 transform transition-all duration-300 ${
          isVisible
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 -translate-y-4 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Создать турнир</h2>
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

        {/* Отображение ошибки */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название турнира *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Введите название турнира"
              autoFocus
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as
                    | "upcoming"
                    | "ongoing"
                    | "completed",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={loading}
            >
              <option value="upcoming">Предстоящий</option>
              <option value="ongoing">Активный</option>
              <option value="completed">Завершенный</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MVP (Необязательно)
            </label>
            <select
              value={formData.mvpId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mvpId: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={loading}
            >
              <option value="">Выберите MVP</option>
              {/*mockProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))*/}
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md transition-all duration-200 font-medium transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              {loading ? "Создание..." : "Создать турнир"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition-all duration-200 font-medium transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTournamentForm;
