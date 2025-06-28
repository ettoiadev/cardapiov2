"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"

interface Produto {
  id: string
  nome: string
  descricao: string | null
  preco_tradicional: number | null
  preco_broto: number | null
  tipo: string
  ativo: boolean
}

interface PizzaSelectionModalProps {
  pizza: Produto
  isOpen: boolean
  onClose: () => void
}

export function PizzaSelectionModal({ pizza, isOpen, onClose }: PizzaSelectionModalProps) {
  const [selectedSize, setSelectedSize] = useState<"broto" | "tradicional">("tradicional")
  const { dispatch } = useCart()

  const handleAddToCart = () => {
    const preco = selectedSize === "broto" ? pizza.preco_broto : pizza.preco_tradicional

    if (!preco) return

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: `${pizza.id}-${selectedSize}`,
        nome: pizza.nome,
        tamanho: selectedSize,
        sabores: [pizza.nome],
        preco,
        tipo: pizza.tipo,
      },
    })

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{pizza.nome}</span>
            {pizza.tipo === "doce" && (
              <Badge variant="secondary" className="text-xs">
                Doce
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {pizza.descricao && <p className="text-sm text-gray-600">{pizza.descricao}</p>}

          <div className="space-y-3">
            <Label className="text-base font-medium">Escolha o tamanho:</Label>

            <RadioGroup
              value={selectedSize}
              onValueChange={(value) => setSelectedSize(value as "broto" | "tradicional")}
              className="space-y-2"
            >
              {pizza.preco_broto && (
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="broto" id="broto" />
                  <Label htmlFor="broto" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Broto</div>
                        <div className="text-sm text-gray-500">4 fatias</div>
                      </div>
                      <div className="font-medium text-red-600">R${pizza.preco_broto.toFixed(2)}</div>
                    </div>
                  </Label>
                </div>
              )}

              {pizza.preco_tradicional && (
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="tradicional" id="tradicional" />
                  <Label htmlFor="tradicional" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Tradicional</div>
                        <div className="text-sm text-gray-500">8 fatias</div>
                      </div>
                      <div className="font-medium text-red-600">R${pizza.preco_tradicional.toFixed(2)}</div>
                    </div>
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button onClick={handleAddToCart} className="flex-1 bg-red-600 hover:bg-red-700">
              Adicionar ao carrinho
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
