import { writable } from "svelte/store";
export interface CartItem {
    id: string;
    color: string;
    order: {
        scale: string;
        kits: number;
        figures: {
            standing_man: number;
            standing_woman: number;
            sitting: number;
            walking: number;
            kit?: undefined;
        } | {
            kit: string;
            standing_man?: undefined;
            standing_woman?: undefined;
            sitting?: undefined;
            walking?: undefined;
        };
        figuresPerKit: number;
        totalFigures: number;
        totalAmount: number;
        costPerFigure: number;
    };
}
export const cartItems = writable<CartItem[]>([]);