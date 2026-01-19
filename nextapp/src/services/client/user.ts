import type { PaginationParams, Profile, ProfilesResponse } from "@/types";
import { api } from "./api";

// Получение профилей с пагинацией
export const getProfiles = async ({
  limit,
  page,
}: {
  limit: number;
  page: number;
}): Promise<ProfilesResponse> => {
  const response = await api.get<ProfilesResponse>("/users/profile", {
    params: {
      limit,
      page,
    },
  });

  return response.data;
};

// Получение общего количества профилей (опционально)
export const getProfilesCount = async (): Promise<number> => {
  const response = await api.get<{
    count: number;
  }>("/users/profiles/count");
  return response.data.count;
};

export const addProfiles = async (
  data: {
    name: string;
    email: string | null;
    faceitLink: string | null;
    users: {
      id: number;
      nickname: string;
    }[];
  }[]
) => {
  const response = await api.post("/users/profile", {
    data,
  });
};
