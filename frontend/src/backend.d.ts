import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MenuItem {
    id: MenuItemId;
    name: string;
    isAvailable: boolean;
    description: string;
    imageUrl?: string;
    category: Category;
    price: number;
}
export type MenuItemId = bigint;
export interface UpiSettings {
    merchantName: string;
    qrCodeData: string;
    upiId: string;
}
export enum Category {
    mainCourse = "mainCourse",
    dessert = "dessert",
    appetizer = "appetizer",
    beverage = "beverage"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMenuItem(name: string, description: string, price: number, category: Category, imageUrl: string | null): Promise<MenuItemId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMenuItem(id: MenuItemId): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getMenuItems(): Promise<Array<MenuItem>>;
    getUpiSettings(): Promise<UpiSettings | null>;
    isCallerAdmin(): Promise<boolean>;
    toggleAvailability(id: MenuItemId): Promise<void>;
    updateMenuItem(id: MenuItemId, name: string, description: string, price: number, category: Category, imageUrl: string | null): Promise<void>;
    updateUpiSettings(newSettings: UpiSettings): Promise<void>;
}
