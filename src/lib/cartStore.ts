import { writable } from "svelte/store";
export interface CartItem {
    id: string;
    color: string;
    order: {
        totalAmount: number;
        totalViniles: number;
        selectedVinil: number;
        vinilDimensions: string;
        vinilColor: string;
    };
}
export const cartItems = writable<CartItem[]>([]);