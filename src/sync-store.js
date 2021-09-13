import { writable } from "svelte/store";
export const sync = writable({
  loadImagesCount: {},
  loadEventDispatched: false
});