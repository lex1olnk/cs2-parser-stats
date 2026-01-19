import React, { useEffect, useCallback } from "react";
import { useStore } from "@/store";
import { useShallow } from "zustand/shallow";

const ProfilesTab: React.FC = () => {
  const { profiles, pagination, loading, totalProfiles } = useStore(
    useShallow((state) => ({
      profiles: state.profiles,
      pagination: state.pagination,
      loading: state.loading,
      totalProfiles: state.totalProfiles,
    }))
  );

  const { fetchProfiles, setShowProfileForm } = useStore(
    useShallow((state) => ({
      fetchProfiles: state.fetchProfiles,
      setShowProfileForm: state.setShowProfileForm,
      //fetchTotalProfilesCount: state.fetchTotalProfilesCount,
    }))
  );

  // Загрузка профилей при монтировании
  useEffect(() => {
    fetchProfiles(1, 10);
  }, [fetchProfiles]);

  // Обработчик смены страницы
  const handlePageChange = useCallback(
    (newPage: number) => {
      fetchProfiles(newPage, pagination.pageSize);
    },
    [fetchProfiles, pagination.pageSize]
  );

  // Обработчик изменения размера страницы
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      fetchProfiles(1, newPageSize);
    },
    [fetchProfiles]
  );

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Управление профилями
        </h2>
        <div className="text-sm text-gray-600">
          <button
            onClick={() => setShowProfileForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            + Add Profile
          </button>
        </div>
      </div>
      {/* Пагинация */}
      <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Страница {pagination.currentPage} из {pagination.total}
          </span>

          <select
            value={pagination.pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
            disabled={loading}
          >
            <option value={10}>10 на странице</option>
            <option value={25}>25 на странице</option>
            <option value={50}>50 на странице</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1 || loading}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Назад
          </button>

          <span className="text-sm text-gray-600">
            {pagination.total > 0
              ? `Показано ${
                  (pagination.currentPage - 1) * pagination.pageSize + 1
                }-${Math.min(
                  pagination.currentPage * pagination.pageSize,
                  totalProfiles
                )} из ${totalProfiles}`
              : "Нет данных"}
          </span>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={
              pagination.currentPage === pagination.total ||
              loading ||
              pagination.total === 0
            }
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Вперед
          </button>
        </div>
      </div>

      {/* Таблица */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Загрузка профилей...</span>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              {/* Заголовок таблицы */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Имя профиля
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Faceit ссылка
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Связь с пользователями
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата создания
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>

              {/* Тело таблицы */}
              <tbody className="bg-white divide-y divide-gray-200">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {profile.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {profile.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {profile.email || "Не указан"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a
                        href={profile.faceitLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-800 hover:underline"
                      >
                        Перейти к профилю
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          profile.isLinkedToUsers
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {profile.isLinkedToUsers
                          ? `✓ Связан (${profile.userCount})`
                          : "Нет связи"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(profile.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Редактировать
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {profiles.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500">Профили не найдены</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilesTab;
