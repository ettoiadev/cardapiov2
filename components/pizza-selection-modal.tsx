"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus } from "lucide-react"
import { useCart } from "@/lib/cart-context"

interface Pizza {
  id: string
  nome: string
  descricao: string | null
  preco_tradicional: number | null
  preco_broto: number | null
  tipo: string
}

interface PizzaSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  pizzas: Pizza[]
}

export function PizzaSelectionModal({ isOpen, onClose, pizzas }: PizzaSelectionModalProps) {
  const [saboresMode, setSaboresMode] = useState<"1" | "2">("1")
  const [tamanho, setTamanho] = useState<"tradicional" | "broto">("tradicional")
  const [saboresSelecionados, setSaboresSelecionados] = useState<string[]>([])
  const [quantidade, setQuantidade] = useState(1)
  const { dispatch } = useCart()

  const pizzasSalgadas = pizzas.filter((p) => p.tipo === "salgada")
  const pizzasDoces = pizzas.filter((p) => p.tipo === "doce")
  const pizzasDisponiveis = saboresMode === "2" ? pizzasSalgadas : pizzas

  const precoBase = tamanho === "tradicional" ? 35 : 25 // Preço base para cálculo
  const precoTotal = precoBase * quantidade

  const handleSaborChange = (pizzaId: string, checked: boolean) => {
    if (saboresMode === "1") {
      setSaboresSelecionados(checked ? [pizzaId] : [])
    } else {
      if (checked) {
        if (saboresSelecionados.length < 2) {
          setSaboresSelecionados([...saboresSelecionados, pizzaId])
        }
      } else {
        setSaboresSelecionados(saboresSelecionados.filter((id) => id !== pizzaId))
      }
    }
  }

  const handleAddToCart = () => {
    if (saboresSelecionados.length === 0) return

    const saboresNomes = saboresSelecionados.map((id) => pizzas.find((p) => p.id === id)?.nome || "")

    const cartItem = {
      id: `pizza-${Date.now()}`,
      produtoId: saboresSelecionados[0],
      nome: saboresNomes.join(" + "),
      tamanho,
      sabores: saboresNomes,
      quantidade,
      precoUnitario: precoBase,
      precoTotal,
      tipo: "pizza" as const,
    }

    dispatch({ type: "ADD_ITEM", payload: cartItem })
    onClose()

    // Reset form
    setSaboresSelecionados([])
    setQuantidade(1)
    setSaboresMode("1")
    setTamanho("tradicional")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escolha sua Pizza</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de tamanho */}
          <div>
            <h3 className="font-semibold mb-3">Tamanho</h3>
            <RadioGroup value={tamanho} onValueChange={(value: "tradicional" | "broto") => setTamanho(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tradicional" id="tradicional" />
                <Label htmlFor="tradicional">Tradicional (8 fatias)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="broto" id="broto" />
                <Label htmlFor="broto">Broto (4 fatias)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Seleção de sabores */}
          <div>
            <h3 className="font-semibold mb-3">Sabores</h3>
            <p className="text-sm text-muted-foreground mb-4">Você pode escolher até 2 sabores</p>

            <div className="flex gap-4 mb-4">
              <Button
                variant={saboresMode === "1" ? "default" : "outline"}
                onClick={() => {
                  setSaboresMode("1")
                  setSaboresSelecionados([])
                }}
                className="flex flex-col items-center p-4 h-auto"
              >
                <div className="w-8 h-8 rounded-full border-2 border-current mb-2" />
                <span>1</span>
              </Button>
              <Button
                variant={saboresMode === "2" ? "default" : "outline"}
                onClick={() => {
                  setSaboresMode("2")
                  setSaboresSelecionados([])
                }}
                className="flex flex-col items-center p-4 h-auto"
              >
                <div className="w-8 h-8 rounded-full border-2 border-current mb-2 relative">
                  <div className="absolute inset-0 border-r-2 border-current" />
                </div>
                <span>2</span>
              </Button>
            </div>

            {saboresMode === "2" && (
              <div className="mb-4">
                <Badge variant="secondary">{saboresSelecionados.length}/2 sabores selecionados</Badge>
              </div>
            )}
          </div>

          {/* Lista de pizzas */}
          <div className="space-y-4">
            {pizzasSalgadas.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-green-600">Pizzas Salgadas</h4>
                <div className="space-y-3">
                  {pizzasSalgadas.map((pizza) => (
                    <div key={pizza.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      {saboresMode === "1" ? (
                        <RadioGroup
                          value={saboresSelecionados[0] || ""}
                          onValueChange={(value) => handleSaborChange(value, true)}
                        >
                          <RadioGroupItem value={pizza.id} id={pizza.id} />
                        </RadioGroup>
                      ) : (
                        <Checkbox
                          id={pizza.id}
                          checked={saboresSelecionados.includes(pizza.id)}
                          onCheckedChange={(checked) => handleSaborChange(pizza.id, !!checked)}
                          disabled={!saboresSelecionados.includes(pizza.id) && saboresSelecionados.length >= 2}
                        />
                      )}
                      <div className="flex-1">
                        <Label htmlFor={pizza.id} className="font-medium cursor-pointer">
                          {pizza.nome}
                        </Label>
                        {pizza.descricao && <p className="text-sm text-muted-foreground mt-1">{pizza.descricao}</p>}
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>Tradicional: R$ {pizza.preco_tradicional?.toFixed(2)}</span>
                          <span>Broto: R$ {pizza.preco_broto?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pizzasDoces.length > 0 && saboresMode === "1" && (
              <div>
                <h4 className="font-medium mb-3 text-pink-600">Pizzas Doces</h4>
                <div className="space-y-3">
                  {pizzasDoces.map((pizza) => (
                    <div key={pizza.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <RadioGroup
                        value={saboresSelecionados[0] || ""}
                        onValueChange={(value) => handleSaborChange(value, true)}
                      >
                        <RadioGroupItem value={pizza.id} id={pizza.id} />
                      </RadioGroup>
                      <div className="flex-1">
                        <Label htmlFor={pizza.id} className="font-medium cursor-pointer">
                          {pizza.nome}
                        </Label>
                        {pizza.descricao && <p className="text-sm text-muted-foreground mt-1">{pizza.descricao}</p>}
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>Tradicional: R$ {pizza.preco_tradicional?.toFixed(2)}</span>
                          <span>Broto: R$ {pizza.preco_broto?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantidade */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Quantidade</span>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                disabled={quantidade <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{quantidade}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantidade(quantidade + 1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Botão adicionar */}
          <Button onClick={handleAddToCart} disabled={saboresSelecionados.length === 0} className="w-full" size="lg">
            Adicionar ao carrinho - R$ {precoTotal.toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
