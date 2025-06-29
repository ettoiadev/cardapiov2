"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/currency-utils"

export function CartFooter() {
  const { state, dispatch } = useCart()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [itemsAnimation, setItemsAnimation] = useState(false)

  if (state.items.length === 0) {
    return null
  }

  const totalItems = state.items.reduce((sum, item) => sum + item.quantidade, 0)

  // Animação quando itens mudam
  useEffect(() => {
    if (totalItems > 0) {
      setItemsAnimation(true)
      const timer = setTimeout(() => setItemsAnimation(false), 300)
      return () => clearTimeout(timer)
    }
  }, [totalItems])

  const handleClearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const handleCheckout = async () => {
    setIsLoading(true)
    // Simular um pequeno delay para mostrar o loading
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push("/checkout")
    setIsLoading(false)
  }

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 cart-footer-shadow z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-3 items-center gap-4">
            {/* Coluna Esquerda - Lixeira */}
            <div className="flex justify-start">
              <div className="relative">
                <Button
                  onClick={handleClearCart}
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-lg text-neutral-600 hover:text-red-500 hover:bg-red-50 transition-all duration-200 active:scale-95"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <Trash2 className="w-5 h-5 stroke-2" />
                </Button>
                
                {/* Tooltip */}
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-10">
                    Limpar carrinho
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-800"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna Central - Contador de Itens */}
            <div className={`flex items-center justify-center space-x-2 ${itemsAnimation ? 'smooth-bounce' : ''}`}>
              <ShoppingCart className="w-5 h-5 text-neutral-600 stroke-2" />
              <span className="text-neutral-800 font-medium">
                {totalItems} {totalItems === 1 ? "item" : "itens"}
              </span>
            </div>

            {/* Coluna Direita - Botão Fechar Pedido */}
            <div className="flex justify-end">
              <Button
                onClick={handleCheckout}
                disabled={isLoading}
                className="cart-button-gradient text-white font-semibold px-6 py-3 h-11 rounded-lg shadow-md disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px]"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span>Fechar pedido</span>
                    <span className="font-bold text-green-100 ml-3">
                      {formatCurrency(state.total)}
                    </span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 cart-footer-shadow z-50">
        <div className="p-4 space-y-3">
          {/* Linha Superior - Contador e Lixeira */}
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 ${itemsAnimation ? 'smooth-bounce' : ''}`}>
              <ShoppingCart className="w-5 h-5 text-neutral-600 stroke-2" />
              <span className="text-neutral-800 font-medium">
                {totalItems} {totalItems === 1 ? "item" : "itens"}
              </span>
            </div>
            
            <div className="relative">
              <Button
                onClick={handleClearCart}
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg text-neutral-600 hover:text-red-500 hover:bg-red-50 transition-all duration-200 active:scale-95"
                onTouchStart={() => setShowTooltip(true)}
                onTouchEnd={() => setTimeout(() => setShowTooltip(false), 1500)}
              >
                <Trash2 className="w-5 h-5 stroke-2" />
              </Button>
              
              {/* Tooltip Mobile */}
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-800 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-10">
                  Limpar carrinho
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-800"></div>
                </div>
              )}
            </div>
          </div>

          {/* Linha Inferior - Total e Botão */}
          <div className="space-y-2">
            <div className="text-center">
              <span className="text-lg font-bold text-neutral-800">
                Total: {formatCurrency(state.total)}
              </span>
            </div>
            
            <Button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full cart-button-gradient text-white font-semibold py-3 h-12 rounded-lg shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando...</span>
                </div>
              ) : (
                "Fechar pedido"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
