"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import axiosInterceptor from "@/lib/axiosInterceptor";
import { ErrorToast } from "@/components/global/ToastContainer";

export interface CartItem {
  plantId: string;
  plantName: string;
  plantImage: string;

  startDate: string;
  endDate: string;
  country: string;
  rentalDays: number;

  pricePerDay: number;
  totalPrice: number;
  numPlants: number;

  size?: {
    id: string;
    name: string;
    height: string;
  } | null;

  pot?: {
    id: string;
    name: string;
    color: string;
    image?: string;
  } | null;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (plantId: string) => Promise<void>;
  updateCartItem: (plantId: string, updatedItem: CartItem) => Promise<void>;
  getCartCount: () => number;
  clearCart: () => void;
  getBookedDatesForPlant: (plantId: string) => { start: Date; end: Date }[];
  getCartTotal: () => number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  // Add to cart with API validation

  const addToCart = async (item: CartItem) => {
    // 1️⃣ Call API to validate/add cart
    try {
      await axiosInterceptor.post("/cart/validate", {
        plantId: item.plantId,
        startDate: item.startDate,
        endDate: item.endDate,
        quantity: item.numPlants,
      });
      // You could also call /api/cart/add if you have that
    } catch (err) {
      console.error("Failed to validate cart with API:", err);
      ErrorToast("Failed to add to cart. Please try again.");
      return;
    }

    // 2️⃣ Then update local state
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.plantId === item.plantId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = item;
        return updated;
      }
      return [...prev, item];
    });
  };

  const removeFromCart = async (plantId: string) => {
    setCartItems((prev) => prev.filter((item) => item.plantId !== plantId));
  };

  const getCartCount = () => cartItems.length;
  const clearCart = () => setCartItems([]);
  const getCartTotal = () =>
    cartItems.reduce((acc, item) => acc + item.totalPrice, 0);

  // For booked date ranges, combine local cart and existing bookings (optional)
  const existingBookings: Record<string, { start: Date; end: Date }[]> = {};
  const getBookedDatesForPlant = (plantId: string) => {
    const fromCart = cartItems
      .filter((item) => item.plantId === plantId)
      .map((item) => ({
        start: new Date(item.startDate),
        end: new Date(item.endDate),
      }));
    const fromExisting = existingBookings[plantId] || [];
    return [...fromExisting, ...fromCart];
  };
  const updateCartItem = async (plantId: string, updatedItem: CartItem) => {
    try {
      await axiosInterceptor.post("/cart/validate", {
        plantId: updatedItem.plantId,
        startDate: updatedItem.startDate,
        endDate: updatedItem.endDate,
      });
    } catch (err) {
      ErrorToast("Updated dates are not available.");
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => (item.plantId === plantId ? updatedItem : item)),
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        getCartCount,
        clearCart,
        getBookedDatesForPlant,
        getCartTotal,
        isCartOpen,
        setIsCartOpen,
        updateCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
