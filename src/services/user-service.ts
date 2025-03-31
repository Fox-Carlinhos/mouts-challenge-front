import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type User = {
  id: string;
  name?: string;
  email: string;
  about?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateUserInput = {
  name?: string;
  email: string;
  about?: string;
  password: string;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  about?: string;
  password?: string;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get("/users");
    return data.data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (user: CreateUserInput): Promise<User> => {
    const { data } = await api.post("/users", user);
    return data;
  },

  update: async (id: string, user: UpdateUserInput): Promise<User> => {
    const { data } = await api.put(`/users/${id}`, user);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: userApi.getAll,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getById(id),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, user }: { id: string; user: UpdateUserInput }) => userApi.update(id, user),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
