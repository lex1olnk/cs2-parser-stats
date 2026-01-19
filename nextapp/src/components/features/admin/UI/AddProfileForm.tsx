import React, { useState, useEffect, useCallback } from "react";
import { useStore } from "@/store";

interface ProfileData {
  name: string;
  email: string;
  faceitLink: string;
  users: {
    id: number;
    nickname: string;
  }[];
}

interface User {
  id: number;
  nickname: string;
}

const AddProfileForm: React.FC = () => {
  const setShowProfileForm = useStore((state) => state.setShowProfileForm);
  const addProfile = useStore((state) => state.addProfiles);
  const loading = useStore((state) => state.loading);
  const showProfileForm = useStore((state) => state.showProfileForm);

  // Изменяем состояние на массив профилей
  const [profiles, setProfiles] = useState<ProfileData[]>([
    {
      name: "",
      email: "",
      faceitLink: "",
      users: [],
    },
  ]);
  const [isVisible, setIsVisible] = useState(false);

  // Анимация появления
  useEffect(() => {
    if (showProfileForm) {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
    }
  }, [showProfileForm]);

  // Добавление нового профиля
  const addNewProfile = () => {
    setProfiles((prev) => [
      ...prev,
      {
        name: "",
        email: "",
        faceitLink: "",
        users: [],
      },
    ]);
  };

  // Удаление профиля
  const removeProfile = (index: number) => {
    if (profiles.length > 1) {
      setProfiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Изменение данных профиля
  const handleProfileChange = (
    index: number,
    field: keyof ProfileData,
    value: string | User[]
  ) => {
    setProfiles((prev) =>
      prev.map((profile, i) =>
        i === index ? { ...profile, [field]: value } : profile
      )
    );
  };

  // Добавление пользователя к профилю
  const addUserToProfile = (profileIndex: number) => {
    const newUser: User = {
      id: Date.now(), // временный ID
      nickname: "",
    };
    setProfiles((prev) =>
      prev.map((profile, i) =>
        i === profileIndex
          ? { ...profile, users: [...profile.users, newUser] }
          : profile
      )
    );
  };

  // Изменение пользователя
  const handleUserChange = (
    profileIndex: number,
    userIndex: number,
    value: string
  ) => {
    setProfiles((prev) =>
      prev.map((profile, i) =>
        i === profileIndex
          ? {
              ...profile,
              users: profile.users.map((user, j) =>
                j === userIndex ? { ...user, nickname: value } : user
              ),
            }
          : profile
      )
    );
  };

  // Удаление пользователя
  const removeUserFromProfile = (profileIndex: number, userIndex: number) => {
    setProfiles((prev) =>
      prev.map((profile, i) =>
        i === profileIndex
          ? {
              ...profile,
              users: profile.users.filter((_, j) => j !== userIndex),
            }
          : profile
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверка обязательных полей для всех профилей
    const hasEmptyFields = profiles.some(
      (profile) => !profile.name.trim() || !profile.email.trim()
    );

    if (hasEmptyFields) {
      alert("Заполните обязательные поля (Имя и Email) для всех профилей");
      return;
    }

    try {
      await addProfile(profiles);

      // Сброс формы и закрытие
      setProfiles([
        {
          name: "",
          email: "",
          faceitLink: "",
          users: [],
        },
      ]);
      setShowProfileForm(false);
    } catch (error) {
      console.error("Failed to add profiles:", error);
      alert("Ошибка при добавлении профилей");
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
      setShowProfileForm(false);
    }, 300);
  }, [setShowProfileForm]);

  if (!showProfileForm && !isVisible) {
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
        className={`bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          isVisible
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 -translate-y-4 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Добавить профили ({profiles.length})
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
          {profiles.map((profile, profileIndex) => (
            <div
              key={profileIndex}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Профиль #{profileIndex + 1}
                </h3>
                {profiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProfile(profileIndex)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    disabled={loading}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Основная информация профиля */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Имя */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      handleProfileChange(profileIndex, "name", e.target.value)
                    }
                    placeholder="Введите полное имя"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      handleProfileChange(profileIndex, "email", e.target.value)
                    }
                    placeholder="example@company.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* FACEIT ссылка */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  FACEIT ссылка
                </label>
                <input
                  type="text"
                  value={profile.faceitLink}
                  onChange={(e) =>
                    handleProfileChange(
                      profileIndex,
                      "faceitLink",
                      e.target.value
                    )
                  }
                  placeholder="https://www.faceit.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </div>

              {/* Пользователи */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Пользователи
                  </label>
                  <button
                    type="button"
                    onClick={() => addUserToProfile(profileIndex)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    disabled={loading}
                  >
                    + Добавить пользователя
                  </button>
                </div>

                {profile.users.map((user, userIndex) => (
                  <div key={user.id} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={user.nickname}
                      onChange={(e) =>
                        handleUserChange(
                          profileIndex,
                          userIndex,
                          e.target.value
                        )
                      }
                      placeholder="Никнейм пользователя"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeUserFromProfile(profileIndex, userIndex)
                      }
                      className="text-red-500 hover:text-red-700 transition-colors duration-200 p-2"
                      disabled={loading}
                    >
                      <svg
                        className="w-4 h-4"
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
                ))}
              </div>
            </div>
          ))}

          {/* Кнопка добавления нового профиля */}
          <button
            type="button"
            onClick={addNewProfile}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2"
            disabled={loading}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Добавить еще профиль
          </button>

          {/* Кнопки отправки */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="submit"
              disabled={
                loading ||
                profiles.some(
                  (profile) => !profile.name.trim() || !profile.email.trim()
                )
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md transition-all duration-200 font-medium transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              {loading
                ? `Добавление ${profiles.length} профилей...`
                : `Добавить ${profiles.length} профилей`}
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

export default AddProfileForm;
