"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bike, Package, Edit2, Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/currency-utils"

interface PizzariaConfig {
  taxa_entrega: number
  valor_minimo: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { state, dispatch } = useCart()
  const [tipoEntrega, setTipoEntrega] = useState<"delivery" | "balcao">("delivery")
  const [config, setConfig] = useState<PizzariaConfig | null>(null)
  const [observacoes, setObservacoes] = useState("")

  const totalItens = state.items.reduce((sum, item) => sum + item.quantidade, 0)

  useEffect(() => {
    if (totalItens === 0) {
      router.push("/")
      return
    }
    loadConfig()
  }, [totalItens, router])

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase.from("pizzaria_config").select("taxa_entrega, valor_minimo").single()

      if (error) {
        console.error("Erro ao carregar configurações:", error)
        // Set default config
        setConfig({
          taxa_entrega: 5.0,
          valor_minimo: 20.0,
        })
      } else if (data) {
        setConfig(data)
      }
    } catch (error) {
      console.error("Erro ao conectar com Supabase:", error)
      // Set default config
      setConfig({
        taxa_entrega: 5.0,
        valor_minimo: 20.0,
      })
    }
  }

  if (!config) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  const subtotal = state.total
  const taxaEntrega = tipoEntrega === "delivery" ? config.taxa_entrega : 0
  const total = subtotal + taxaEntrega

  const handleContinuar = () => {
    if (tipoEntrega === "delivery") {
      router.push("/checkout/delivery")
    } else {
      router.push("/checkout/balcao")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center sticky top-0 z-10 shadow-sm">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Checkout</h1>
      </div>

      {/* Content area with scroll */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-6">
          {/* Tipo de entrega */}
          <Card className="shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Tipo de entrega</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <RadioGroup value={tipoEntrega} onValueChange={(value: "delivery" | "balcao") => setTipoEntrega(value)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 border-transparent rounded-xl bg-white shadow-sm hover:border-green-200 transition-colors">
                    <RadioGroupItem value="delivery" id="delivery" className="text-green-600" />
                    <Label htmlFor="delivery" className="flex items-center space-x-3 cursor-pointer flex-1">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Bike className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Delivery</span>
                        <p className="text-sm text-gray-500">Entrega em domicílio</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 border-transparent rounded-xl bg-white shadow-sm hover:border-blue-200 transition-colors">
                    <RadioGroupItem value="balcao" id="balcao" className="text-blue-600" />
                    <Label htmlFor="balcao" className="flex items-center space-x-3 cursor-pointer flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Balcão</span>
                        <p className="text-sm text-gray-500">Retirada no local</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

        {/* Resumo do pedido */}
        <Card className="shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">Seu pedido</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* 1. Resumo dos produtos selecionados */}
            <div className="space-y-4 p-4">
              {state.items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="bg-gray-50 rounded-xl p-4 space-y-4">
                  {/* Informações do produto */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{item.nome}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.tamanho}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          Qtd: {item.quantidade}
                        </span>
                      </div>
                      {item.sabores.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 font-medium">
                            {item.sabores.length === 1 ? 'Sabor:' : 'Sabores:'}
                          </p>
                          <p className="text-sm text-gray-700">{item.sabores.join(", ")}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(item.preco * item.quantidade)}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.preco)} cada</p>
                    </div>
                  </div>

                  {/* Controles de quantidade e remoção */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white rounded-lg border border-gray-300">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-l-lg hover:bg-gray-100"
                          onClick={() => {
                            if (item.quantidade > 1) {
                              dispatch({
                                type: "UPDATE_QUANTITY",
                                payload: { id: item.id, quantidade: item.quantidade - 1 }
                              })
                            }
                          }}
                          disabled={item.quantidade <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-3 py-1 text-sm font-medium bg-white min-w-[40px] text-center">
                          {item.quantidade}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-r-lg hover:bg-gray-100"
                          onClick={() => {
                            dispatch({
                              type: "UPDATE_QUANTITY",
                              payload: { id: item.id, quantidade: item.quantidade + 1 }
                            })
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          // Funcionalidade de editar pode ser implementada futuramente
                          // Por enquanto, apenas um placeholder
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          dispatch({ type: "REMOVE_ITEM", payload: item.id })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 2. Escolha de opcionais (preparado para futuras implementações) */}
                  {item.tipo === "pizza" && (
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Opcionais</h4>
                      <p className="text-xs text-gray-500 italic">
                        Funcionalidade em desenvolvimento - opcionais serão disponibilizados em breve
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 3. Campo de Observações */}
            <div className="px-4 pb-4">
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700 mb-2 block">
                  Observações
                </Label>
                <Textarea
                  id="observacoes"
                  placeholder="Ex: Sem cebola, bem passado, embalagem separada..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full bg-white border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200 rounded-lg"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Informe qualquer preferência especial para seu pedido
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Resumo de valores */}
          <Card className="shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-100 pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              {tipoEntrega === "delivery" && (
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700">Taxa de entrega</span>
                  <span className="font-semibold text-blue-900">{formatCurrency(taxaEntrega)}</span>
                </div>
              )}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-xl font-bold text-green-800">Total</span>
                  <span className="text-2xl font-bold text-green-900">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verificação de valor mínimo */}
          {subtotal < config.valor_minimo && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center">
                  <span className="text-yellow-800 text-sm font-bold">!</span>
                </div>
                <div>
                  <p className="text-yellow-800 text-sm font-medium">
                    Valor mínimo para pedido: {formatCurrency(config.valor_minimo)}
                  </p>
                  <p className="text-yellow-700 text-sm mt-1">
                    Adicione mais {formatCurrency(config.valor_minimo - subtotal)} ao seu pedido.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão CONTINUAR fixo na base */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
        <Button 
          onClick={handleContinuar} 
          disabled={subtotal < config.valor_minimo} 
          className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl shadow-lg" 
          size="lg"
        >
          {subtotal < config.valor_minimo ? (
            `Faltam ${formatCurrency(config.valor_minimo - subtotal)}`
          ) : (
            "CONTINUAR"
          )}
        </Button>
      </div>
    </div>
  )
}
