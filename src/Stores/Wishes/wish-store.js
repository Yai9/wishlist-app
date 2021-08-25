import { writable } from "svelte/store";

const wishes = writable([]);

const customWishesStore = {
  subscribe: wishes.subscribe,
  setWishes: (data) => {
    wishes.set(data);
  },
  addWish: (wishData) => {
    const newWish = {
      ...wishData,
    };
    wishes.update((items) => {
      return [newWish, ...items];
    });
  },
  toggleFavorite: (id) => {
    wishes.update((items) => {
      const updatedWish = { ...items.find((e) => e.id === id) };
      const wishIndex = items.findIndex((e) => e.id === id);
      updatedWish.isFavorite = !updatedWish.isFavorite;
      const updatedWishes = [...items];
      updatedWishes[wishIndex] = updatedWish;
      return updatedWishes;
    });
  },
  updateWish: (id, wishData) => {
    wishes.update((items) => {
      const updatedWish = { ...items.find((e) => e.id === id), ...wishData };
      const wishIndex = items.findIndex((e) => e.id === id);
      const updatedWishes = [...items];
      updatedWishes[wishIndex] = updatedWish;
      console.log(...items, "items");
      console.log({ ...wishData }, "wishes");
      return updatedWishes;
    });
  },
  removeWish: (id) => {
    wishes.update((items) => {
      return items.filter((i) => i.id !== id);
    });
  },
};
export default customWishesStore;
