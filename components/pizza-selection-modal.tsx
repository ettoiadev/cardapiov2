"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "@/lib/cart-context"
import { useConfig } from "@/lib/config-context"
import { formatCurrency } from "@/lib/currency-utils"

interface Adicional {
  nome: string
  preco: number
}

interface Produto {
  id: string
  nome: string
  descricao: string | null
  preco_tradicional: number | null
  preco_broto: number | null
  tipo: string
  ativo: boolean
  adicionais?: Adicional[]
}

interface PizzaSelectionModalProps {
  pizza: Produto
  isOpen: boolean
  onClose: () => void
  multiFlavorMode?: boolean
  availablePizzas?: Produto[]
  onAddedToCart?: () => void
}

interface SelectedAdicionais {
  [saborNome: string]: { nome: string; preco: number }[]
}

export function PizzaSelectionModal({ pizza, isOpen, onClose, multiFlavorMode = false, availablePizzas = [], onAddedToCart }: PizzaSelectionModalProps) {
  const [selectedSize, setSelectedSize] = useState<"broto" | "tradicional">("tradicional")
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [selectedAdicionais, setSelectedAdicionais] = useState<SelectedAdicionais>({})
  const { dispatch } = useCart()
  const { config } = useConfig()
  const router = useRouter()

  // Resetar adicionais quando os sabores mudarem
  useEffect(() => {
    setSelectedAdicionais({})
  }, [selectedFlavors])

  const handleFlavorSelection = (flavorName: string) => {
    if (selectedFlavors.includes(flavorName)) {
      // Remove o sabor se já estiver selecionado
      setSelectedFlavors(prev => prev.filter(f => f !== flavorName))
    } else if (selectedFlavors.length < 2) {
      // Adiciona o sabor se ainda não atingiu o limite de 2
      setSelectedFlavors(prev => [...prev, flavorName])
    }
  }

  const handleAdicionalToggle = (saborNome: string, adicional: { nome: string; preco: number }, checked: boolean) => {
    setSelectedAdicionais(prev => {
      const current = prev[saborNome] || []
      
      if (checked) {
        return {
          ...prev,
          [saborNome]: [...current, adicional]
        }
      } else {
        return {
          ...prev,
          [saborNome]: current.filter(item => item.nome !== adicional.nome)
        }
      }
    })
  }

  const calculatePrice = () => {
    let basePrice = 0
    
    if (!multiFlavorMode) {
      basePrice = selectedSize === "broto" ? (pizza.preco_broto || 0) : (pizza.preco_tradicional || 0)
    } else {
      // Para múltiplos sabores, usar o maior preço entre os sabores selecionados
      if (selectedFlavors.length === 0) return 0

      const prices = selectedFlavors.map(flavorName => {
        const flavor = availablePizzas.find(p => p.nome === flavorName)
        return selectedSize === "broto" ? flavor?.preco_broto || 0 : flavor?.preco_tradicional || 0
      })

      basePrice = Math.max(...prices)
    }

    // Calcular preço dos adicionais
    const adicionaisPrice = Object.values(selectedAdicionais).flat().reduce((sum, adicional) => sum + adicional.preco, 0)

    return basePrice + adicionaisPrice
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

    // Preparar adicionais para o carrinho
    const adicionaisForCart = sabores.map(sabor => ({
      sabor,
      itens: selectedAdicionais[sabor] || []
    })).filter(item => item.itens.length > 0)

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: multiFlavorMode ? `multi-${selectedFlavors.sort().join("-")}-${selectedSize}` : `${pizza.id}-${selectedSize}`,
        nome: nomeItem,
        tamanho: selectedSize,
        sabores: sabores,
        preco: preco,
        tipo: pizza.tipo,
        adicionais: adicionaisForCart.length > 0 ? adicionaisForCart : undefined,
      },
    })

    // Reset do estado
    setSelectedFlavors([])
    setSelectedAdicionais({})
    onClose()
    
    // Chamar callback se fornecido (para múltiplos sabores rolarem para próxima categoria)
    if (onAddedToCart) {
      setTimeout(() => {
        onAddedToCart()
      }, 300)
    }
  }

  const getAvailableFlavors = () => {
    return multiFlavorMode ? availablePizzas : [pizza]
  }

  const getFlavorsWithAdicionais = () => {
    const flavors = multiFlavorMode ? selectedFlavors : [pizza.nome]
    return flavors.map(flavorName => {
      const flavor = getAvailableFlavors().find(p => p.nome === flavorName)
      return {
        nome: flavorName,
        adicionais: flavor?.adicionais || []
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

        <div className="space-y-6">
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

          {/* Seção de Adicionais por Sabor */}
          {getFlavorsWithAdicionais().length > 0 && getFlavorsWithAdicionais().some(f => f.adicionais.length > 0) && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Adicionais por Sabor</h3>
              {getFlavorsWithAdicionais().map((flavor) => (
                flavor.adicionais.length > 0 && (
                  <div key={flavor.nome} className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3 text-red-600">{flavor.nome}</h4>
                    <div className="space-y-2">
                      {flavor.adicionais.map((adicional, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`${flavor.nome}-${adicional.nome}`}
                              checked={selectedAdicionais[flavor.nome]?.some(item => item.nome === adicional.nome) || false}
                              onCheckedChange={(checked) => 
                                handleAdicionalToggle(flavor.nome, adicional, checked as boolean)
                              }
                            />
                            <Label 
                              htmlFor={`${flavor.nome}-${adicional.nome}`}
                              className="cursor-pointer flex-1"
                            >
                              {adicional.nome}
                            </Label>
                          </div>
                          <span className="text-sm font-medium text-green-600">
                            +{formatCurrency(adicional.preco)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          <div className="space-y-4">
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
                        {formatCurrency(calculatePrice() || 0)}
                      </div>
                    </div>
                  </Label>
                </div>
              )}

              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="tradicional" id="tradicional" />
                <Label htmlFor="tradicional" className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Tradicional</div>
                      <div className="text-sm text-gray-500">8 fatias</div>
                    </div>
                    <div className="font-medium text-red-600">
                      {formatCurrency(calculatePrice() || 0)}
                    </div>
                  </div>
                </Label>
              </div>
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
