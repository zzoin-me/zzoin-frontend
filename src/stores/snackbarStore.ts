import { create } from "zustand";

export type SnackbarType = "info" | "success" | "warning" | "error";

export interface SnackbarInput {
  message: string;
  type?: SnackbarType;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  dedupeKey?: string;
}

export interface SnackbarItem extends SnackbarInput {
  id: number;
  type: SnackbarType;
  duration: number;
  dedupeKey: string;
}

interface SnackbarState {
  queue: SnackbarItem[];
  show: (input: SnackbarInput) => void;
  dismiss: (id: number) => void;
}

let nextSnackbarId = 1;

export const useSnackbarStore = create<SnackbarState>((set) => ({
  queue: [],
  show: (input) =>
    set((state) => {
      const type = input.type ?? "info";
      const dedupeKey = input.dedupeKey ?? `${type}:${input.message}`;
      if (state.queue.some((item) => item.dedupeKey === dedupeKey)) return state;
      if (state.queue.length >= 5) return state;

      return {
        queue: [
          ...state.queue,
          {
            ...input,
            id: nextSnackbarId++,
            type,
            duration: input.duration ?? (type === "error" ? 4_000 : 3_000),
            dedupeKey,
          },
        ],
      };
    }),
  dismiss: (id) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    })),
}));

export const showSnackbar = (input: SnackbarInput) => {
  useSnackbarStore.getState().show(input);
};
