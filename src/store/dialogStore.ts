import { create } from "zustand";

type DialogState<T> = {
    open: boolean;
    item: T | null;
    readonly?: boolean;
};

type DialogActions<T> = {
    openDialog: (item?: T, readonly?: boolean) => void;
    closeDialog: () => void;
};

type DialogStore<T> = DialogState<T> & DialogActions<T>;

export const dialogStore = <T>() => {
    const defaultState: DialogState<T> = {
        open: false,
        item: null,
        readonly: false,
    };

    return create<DialogStore<T>>()((set) => ({
        ...defaultState,
        openDialog: (item, readonly) => set({ open: true, item, readonly }),
        closeDialog: () => set({ open: false, item: null, readonly: false }),
    }));
};
