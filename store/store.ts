import { create } from 'zustand';

export interface AppState {
  selectedListId: number | null;
  setSelectedListId: (id: number | null) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedListId: null,
  setSelectedListId: (id) => set({ selectedListId: id }),
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));
