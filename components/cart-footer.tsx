"use client"

import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useRouter } from "next/navigation"

export function CartFooter() {
  const { state } = useCart()
  const router = useRouter()

  if (state.quantidade === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
      <Button onClick={() => router.push("/checkout")} className="w-full flex items-center justify-between" size="lg">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="h-5 w-5" />
          <span>
            {state.quantidade} {state.quantidade === 1 ? "item" : "itens"}
          </span>
        </div>
        <span>Fechar pedido</span>
        <span className="font-bold">R$ {state.total.toFixed(2)}</span>
      </Button>
    </div>
  )
}
