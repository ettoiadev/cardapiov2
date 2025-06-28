"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode } from "react"

export interface CartItem {
  id: string
  produtoId: string
  nome: string
  tamanho: "tradicional" | "broto"
  sabores: string[]
  quantidade: number
  precoUnitario: number
  precoTotal: number
  tipo: "pizza" | "bebida"
}

interface CartState {
  items: CartItem[]
  total: number
  quantidade: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantidade: number } }
  | { type: "CLEAR_CART" }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const newItems = [...state.items, action.payload]
      const total = newItems.reduce((sum, item) => sum + item.precoTotal, 0)
      const quantidade = newItems.reduce((sum, item) => sum + item.quantidade, 0)
      return { items: newItems, total, quantidade }
    }
    case "REMOVE_ITEM": {
      const newItems = state.items.filter((item) => item.id !== action.payload)
      const total = newItems.reduce((sum, item) => sum + item.precoTotal, 0)
      const quantidade = newItems.reduce((sum, item) => sum + item.quantidade, 0)
      return { items: newItems, total, quantidade }
    }
    case "UPDATE_QUANTITY": {
      const newItems = state.items.map((item) =>
        item.id === action.payload.id
          ? {
              ...item,
              quantidade: action.payload.quantidade,
              precoTotal: item.precoUnitario * action.payload.quantidade,
            }
          : item,
      )
      const total = newItems.reduce((sum, item) => sum + item.precoTotal, 0)
      const quantidade = newItems.reduce((sum, item) => sum + item.quantidade, 0)
      return { items: newItems, total, quantidade }
    }
    case "CLEAR_CART":
      return { items: [], total: 0, quantidade: 0 }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    quantidade: 0,
  })

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
