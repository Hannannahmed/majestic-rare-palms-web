"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export interface CartItem {
  plantId: number
  plantName: string
  plantImage: string
  startDate: string
  endDate: string
  rentalDays: number
  pricePerDay: number
  totalPrice: number
  size: {
    id: string
    name: string
    height: string
  }
  pot: {
    id: number
    name: string
    color: string
  }
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (plantId: number) => void
  getCartCount: () => number
  clearCart: () => void
  getBookedDatesForPlant: (plantId: number) => { start: Date; end: Date }[]
  getCartTotal: () => number
}

const existingBookings: Record<number, { start: Date; end: Date }[]> = {
  1: [
    { start: new Date(2025, 11, 5), end: new Date(2025, 11, 10) },
    { start: new Date(2025, 11, 20), end: new Date(2025, 11, 25) },
  ],
  2: [{ start: new Date(2025, 11, 8), end: new Date(2025, 11, 15) }],
  3: [
    { start: new Date(2025, 11, 1), end: new Date(2025, 11, 5) },
    { start: new Date(2025, 11, 18), end: new Date(2025, 11, 22) },
  ],
  4: [{ start: new Date(2025, 11, 10), end: new Date(2025, 11, 14) }],
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.plantId === item.plantId)
      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex] = item
        return updated
      }
      return [...prev, item]
    })
  }

  const removeFromCart = (plantId: number) => {
    setCartItems((prev) => prev.filter((item) => item.plantId !== plantId))
  }

  const getCartCount = () => cartItems.length

  const clearCart = () => setCartItems([])

  const getCartTotal = () => cartItems.reduce((acc, item) => acc + item.totalPrice, 0)

  const getBookedDatesForPlant = (plantId: number) => {
    const existing = existingBookings[plantId] || []
    const fromCart = cartItems
      .filter((item) => item.plantId === plantId)
      .map((item) => ({
        start: new Date(item.startDate),
        end: new Date(item.endDate),
      }))
    return [...existing, ...fromCart]
  }

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, getCartCount, clearCart, getBookedDatesForPlant, getCartTotal }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
