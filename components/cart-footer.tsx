"use client"

import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/currency-utils"

export function CartFooter() {
  const { state, dispatch } = useCart()
  const router = useRouter()

  if (state.items.length === 0) {
    return null
  }

  const totalItems = state.items.reduce((sum, item) => sum + item.quantidade, 0)

  const handleClearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white p-4 shadow-lg">
      <div className="flex items-center space-x-3">
        <Button
          onClick={handleClearCart}
          variant="ghost"
          size="icon"
          className="bg-transparent hover:bg-red-700 text-white p-2 shrink-0"
        >
          <Trash2 className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => router.push("/checkout")}
          className="flex-1 bg-transparent hover:bg-red-700 border-none flex items-center justify-between text-white"
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
    </div>
  )
}
