"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import { useConfig } from "@/lib/config-context"
import { formatCurrency } from "@/lib/currency-utils"

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
  multiFlavorMode?: boolean
  availablePizzas?: Produto[]
}

export function PizzaSelectionModal({ pizza, isOpen, onClose, multiFlavorMode = false, availablePizzas = [] }: PizzaSelectionModalProps) {
  const [selectedSize, setSelectedSize] = useState<"broto" | "tradicional">("tradicional")
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const { dispatch } = useCart()
  const { config } = useConfig()
  const router = useRouter()

  const handleFlavorSelection = (flavorName: string) => {
    if (selectedFlavors.includes(flavorName)) {
      // Remove o sabor se já estiver selecionado
      setSelectedFlavors(prev => prev.filter(f => f !== flavorName))
    } else if (selectedFlavors.length < 2) {
      // Adiciona o sabor se ainda não atingiu o limite de 2
      setSelectedFlavors(prev => [...prev, flavorName])
    }
  }

  const calculatePrice = () => {
    if (!multiFlavorMode) {
      return selectedSize === "broto" ? pizza.preco_broto : pizza.preco_tradicional
    }

    // Para múltiplos sabores, usar o maior preço entre os sabores selecionados
    if (selectedFlavors.length === 0) return 0

    const prices = selectedFlavors.map(flavorName => {
      const flavor = availablePizzas.find(p => p.nome === flavorName)
      return selectedSize === "broto" ? flavor?.preco_broto || 0 : flavor?.preco_tradicional || 0
    })

    return Math.max(...prices)
  }

  const canAddToCart = () => {
    if (!multiFlavorMode) {
      return true
    }
    return selectedFlavors.length === 2
  }

  const handleAddToCart = () => {
    const preco = calculatePrice()
    if (!preco) return

    const sabores = multiFlavorMode ? selectedFlavors : [pizza.nome]
    const nomeItem = multiFlavorMode ? `Pizza ${selectedFlavors.join(" + ")}` : pizza.nome

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: multiFlavorMode ? `multi-${selectedFlavors.sort().join("-")}-${selectedSize}` : `${pizza.id}-${selectedSize}`,
        nome: nomeItem,
        tamanho: selectedSize,
        sabores: sabores,
        preco: preco,
        tipo: pizza.tipo,
      },
    })

    // Reset do estado
    setSelectedFlavors([])
    onClose()
    
    // Item adicionado ao carrinho - usuário deve usar botão "Fechar pedido" para finalizar
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{multiFlavorMode ? "Escolha 2 sabores" : pizza.nome}</span>
            {!multiFlavorMode && pizza.tipo === "doce" && (
              <Badge variant="secondary" className="text-xs">
                Doce
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!multiFlavorMode && pizza.descricao && (
            <p className="text-sm text-gray-600">{pizza.descricao}</p>
          )}

          {multiFlavorMode && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                Selecione exatamente 2 sabores ({selectedFlavors.length}/2 selecionados)
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availablePizzas.map((flavor) => (
                  <div 
                    key={flavor.id}
                    className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFlavors.includes(flavor.nome) 
                        ? "border-red-500 bg-red-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleFlavorSelection(flavor.nome)}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedFlavors.includes(flavor.nome) 
                        ? "border-red-500 bg-red-500" 
                        : "border-gray-300"
                    }`}>
                      {selectedFlavors.includes(flavor.nome) && (
                        <div className="w-2 h-2 rounded-full bg-white m-0.5"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{flavor.nome}</span>
                        {flavor.tipo === "doce" && (
                          <Badge variant="secondary" className="text-xs">
                            Doce
                          </Badge>
                        )}
                      </div>
                      {flavor.descricao && (
                        <p className="text-sm text-gray-500 mt-1">{flavor.descricao}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-base font-medium">Escolha o tamanho:</Label>

            <RadioGroup
              value={selectedSize}
              onValueChange={(value) => setSelectedSize(value as "broto" | "tradicional")}
              className="space-y-2"
            >
              {config.habilitar_broto && (multiFlavorMode ? true : pizza.preco_broto) && (
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="broto" id="broto" />
                  <Label htmlFor="broto" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Broto</div>
                        <div className="text-sm text-gray-500">4 fatias</div>
                      </div>
                      <div className="font-medium text-red-600">
                        {multiFlavorMode && selectedFlavors.length > 0 
                          ? formatCurrency(calculatePrice() || 0)
                          : formatCurrency(pizza.preco_broto)}
                      </div>
                    </div>
                  </Label>
                </div>
              )}

              {(multiFlavorMode ? true : pizza.preco_tradicional) && (
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="tradicional" id="tradicional" />
                  <Label htmlFor="tradicional" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Tradicional</div>
                        <div className="text-sm text-gray-500">8 fatias</div>
                      </div>
                      <div className="font-medium text-red-600">
                        {multiFlavorMode && selectedFlavors.length > 0 
                          ? formatCurrency(calculatePrice() || 0)
                          : formatCurrency(pizza.preco_tradicional)}
                      </div>
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
            <Button 
              onClick={handleAddToCart} 
              disabled={!canAddToCart()}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Adicionar ao carrinho
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
