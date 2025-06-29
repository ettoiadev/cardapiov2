"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/currency-utils"

export function CartFooter() {
  const { state } = useCart()
  const router = useRouter()

  if (state.items.length === 0) {
    return null
  }

  const totalItems = state.items.reduce((sum, item) => sum + item.quantidade, 0)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-4 shadow-lg">
      <Button
        onClick={() => router.push("/checkout")}
        className="w-full bg-transparent hover:bg-red-700 border-none flex items-center justify-between text-white"
      >
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5" />
          <span>
            {totalItems} {totalItems === 1 ? "item" : "itens"}
          </span>
        </div>
        <span>Fechar pedido</span>
        <span className="font-bold">{formatCurrency(state.total)}</span>
      </Button>
    </div>
  )
}
