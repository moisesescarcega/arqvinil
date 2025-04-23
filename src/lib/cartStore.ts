import { writable } from "svelte/store";
export interface CartItem {
    id: string;
    // color: string;
    order: {
        totalAmount: number;
        totalViniles: number;
        selectedVinil: string;
        vinilDimensions: string;
        vinilColor: string;
    };
}
export const cartItems = writable<CartItem[]>([]);