import { create } from 'zustand';
import { Item, type ItemData } from '../../domain/entities/Item';

interface ItemStoreState {
  items: ItemData[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
}

export const useItemStore = create<ItemStoreState>((set) => ({
  items: [],
  loading: true,
  error: null,
  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const fetchedItems = await Item.list();
      set({ items: fetchedItems, loading: false });
    } catch (err) {
      console.error(err);
      set({ error: "Failed to load items.", loading: false });
    }
  },
}));
