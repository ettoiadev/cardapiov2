"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bike, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useCart } from "@/lib/cart-context"
import { supabase } from "@/lib/supabase"

interface PizzariaConfig {
  taxa_entrega: number
  valor_minimo: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { state } = useCart()
  const [tipoEntrega, setTipoEntrega] = useState<"delivery" | "balcao">("delivery")
  const [config, setConfig] = useState<PizzariaConfig | null>(null)

  useEffect(() => {
    if (state.quantidade === 0) {
      router.push("/")
      return
    }
    loadConfig()
  }, [state.quantidade, router])

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Checkout</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Tipo de entrega */}
        <Card>
          <CardHeader>
            <CardTitle>Tipo de entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={tipoEntrega} onValueChange={(value: "delivery" | "balcao") => setTipoEntrega(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="flex items-center space-x-2 cursor-pointer">
                  <Bike className="h-5 w-5 text-green-600" />
                  <span>Delivery</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="balcao" id="balcao" />
                <Label htmlFor="balcao" className="flex items-center space-x-2 cursor-pointer">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span>Balcão</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Resumo do pedido */}
        <Card>
          <CardHeader>
            <CardTitle>Seu pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{item.nome}</p>
                  <p className="text-sm text-gray-600">
                    {item.tamanho} • Qtd: {item.quantidade}
                  </p>
                  {item.sabores.length > 1 && (
                    <p className="text-sm text-gray-500">Sabores: {item.sabores.join(", ")}</p>
                  )}
                </div>
                <p className="font-medium">R$ {item.precoTotal.toFixed(2)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resumo de valores */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            {tipoEntrega === "delivery" && (
              <div className="flex justify-between">
                <span>Taxa de entrega</span>
                <span>R$ {taxaEntrega.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verificação de valor mínimo */}
        {subtotal < config.valor_minimo && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              Valor mínimo para pedido: R$ {config.valor_minimo.toFixed(2)}
              <br />
              Adicione mais R$ {(config.valor_minimo - subtotal).toFixed(2)} ao seu pedido.
            </p>
          </div>
        )}

        <Button onClick={handleContinuar} disabled={subtotal < config.valor_minimo} className="w-full" size="lg">
          CONTINUAR
        </Button>
      </div>
    </div>
  )
}
