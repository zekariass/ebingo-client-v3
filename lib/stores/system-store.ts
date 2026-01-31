import i18n from "@/i18n"
import { create } from "zustand"

interface SystemConfig {
  id: number
  agentId: number
  name: string
  value: string
}

interface SystemStore {
  systemConfigs: SystemConfig[]
  voiceOn: boolean
  localeChanged: boolean
  setSystemConfigs: (configs: SystemConfig[]) => void
  fetchSystemConfigs: (agentId: number) => Promise<void>
  resetSystemConfigs: () => void

  setVoiceOn: (voiceOn: boolean) => void
  setLocaleChanged: (changed: boolean) => void
}


export const useSystemStore = create<SystemStore>((set, get) => ({
    systemConfigs: [],
    voiceOn: true,
    localeChanged: false,
    setSystemConfigs: (configs) => set({ systemConfigs: [...configs] }),
    fetchSystemConfigs: async (agentId) => {
      try {
        if (get().systemConfigs.length > 0) return
        const response = await fetch(`/${i18n.language}/api/system/configs?agentId=${agentId}`);
        if (!response.ok) throw new Error("Failed to fetch system configs");
        const { data } = await response.json();
        
        set({ systemConfigs: [...data] });
      } catch (err) {
        console.error("Error fetching system configs:", err);
      }
    },
    resetSystemConfigs: () => set({ systemConfigs: [] }),
    setVoiceOn: (voiceOn) => set({voiceOn}),
    setLocaleChanged: (changed) => set({localeChanged: changed})
}));