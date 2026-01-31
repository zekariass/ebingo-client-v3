'use client';

import i18n from "@/i18n";
import { create } from "zustand";
import type { UserProfile } from "../types";

export interface UserState {
  user?: UserProfile | null;
  initData: string | null;
  initDataUnsafe: Record<string, any> | null;
  error: string | null;
  loading?: boolean;
  setInitDataUnsafe: (initDataUnsafe: Record<string, any> | null) => void;
  setInitData: (initData: string | null) => void;
  resetInitData: () => void;
  fetchUserProfile: (telegramId: number, agentId: number) => Promise<UserProfile | null>;
}

export const userStore = create<UserState>((set, get) => ({
  initData: null,
  initDataUnsafe: null,
  error: null,

  setInitData: (initData) => set({ initData }),
  setInitDataUnsafe: (initDataUnsafe) => set({ initDataUnsafe }),
  resetInitData: () => set({ initData: null, initDataUnsafe: null }),

  fetchUserProfile: async (telegramId, agentId) => {
    if (get().user?.id) return get().user;

    try {
      set({ loading: true, error: null });
      const response = await fetch(`/${i18n.language}/api/auth/me/${telegramId}?agentId=${agentId}`);
      if (!response.ok) throw new Error("Failed to fetch user profile");

      const { data } = await response.json();
      set({ user: data, loading: false });
      return data;
    } catch (err: any) {
      const message = err?.message ?? "Unknown error";
      console.error("Error fetching user profile:", message);
      set({ loading: false, error: message });
      return null;
    }
  },

}));
