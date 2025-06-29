"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bike, Package, Plus, Minus, MapPin, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/currency-utils"

interface PizzariaConfig {
  taxa_entrega: number
  valor_minimo: number
  telefone: string | null
  whatsapp: string | null
}

interface EnderecoData {
  cep: string
  logradouro: string
  bairro: string
  localidade: string
  uf: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { state, dispatch } = useCart()
  
  const [config, setConfig] = useState<PizzariaConfig | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [tipoEntrega, setTipoEntrega] = useState<"delivery" | "balcao">("delivery")
  
  const [nomeCompleto, setNomeCompleto] = useState("")
  const [telefone, setTelefone] = useState("")
  const [cep, setCep] = useState("")
  const [enderecoData, setEnderecoData] = useState<EnderecoData | null>(null)
  const [numero, setNumero] = useState("")
  const [complemento, setComplemento] = useState("")
  const [observacoesEntrega, setObservacoesEntrega] = useState("")
  const [buscandoCep, setBuscandoCep] = useState(false)
  const [erroCep, setErroCep] = useState("")
  
  const [observacoesPedido, setObservacoesPedido] = useState("")
  const [formaPagamento, setFormaPagamento] = useState<"pix" | "dinheiro" | "debito" | "credito">("pix")

  const totalItens = state.items.reduce((sum, item) => sum + item.quantidade, 0)

  const buscarCep = async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, "")
    if (cepLimpo.length !== 8) {
      setErroCep("CEP deve ter 8 dígitos")
      return
    }

    setBuscandoCep(true)
    setErroCep("")

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()
      if (data.erro) {
        setErroCep("CEP não encontrado")
        setEnderecoData(null)
      } else {
        setEnderecoData(data)
        setErroCep("")
      }
    } catch (error) {
      setErroCep("Erro ao buscar CEP")
      setEnderecoData(null)
    } finally {
      setBuscandoCep(false)
    }
  }

  const handleCepChange = (value: string) => {
    const maskedValue = value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9)
    setCep(maskedValue)
    
    if (maskedValue.replace(/\D/g, "").length === 8) {
      buscarCep(maskedValue)
    } else {
      setEnderecoData(null)
      setErroCep("")
    }
  }

  const handleTelefoneChange = (value: string) => {
    const maskedValue = value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15)
    setTelefone(maskedValue)
  }

  const validarFormulario = () => {
    if (tipoEntrega === "delivery") {
      return nomeCompleto.trim() !== "" && 
             telefone.trim() !== "" && 
             cep.replace(/\D/g, "").length === 8 && 
             enderecoData !== null && 
             numero.trim() !== ""
    }
    return true
  }

  useEffect(() => {
    setIsLoaded(true)
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase.from("pizzaria_config").select("taxa_entrega, valor_minimo, telefone, whatsapp").single()
      if (error) {
        setConfig({
          taxa_entrega: 5.0,
          valor_minimo: 20.0,
          telefone: "(11) 99999-9999",
          whatsapp: "5511999999999"
        })
      } else if (data) {
        setConfig(data)
      }
    } catch (error) {
      setConfig({
        taxa_entrega: 5.0,
        valor_minimo: 20.0,
        telefone: "(11) 99999-9999",
        whatsapp: "5511999999999"
      })
    }
  }

  const gerarTextoWhatsApp = () => {
    let texto = "🍕 *NOVO PEDIDO*\n\n"
    
    texto += "*📋 PEDIDO:*\n"
    state.items.forEach((item, index) => {
      texto += `${index + 1}. ${item.nome}\n`
      texto += `   • Tamanho: ${item.tamanho}\n`
      if (item.sabores.length > 0) {
        texto += `   • Sabor(es): ${item.sabores.join(", ")}\n`
      }
      texto += `   • Quantidade: ${item.quantidade}\n`
      texto += `   • Valor: ${formatCurrency(item.preco * item.quantidade)}\n\n`
    })

    texto += `*🚚 ENTREGA:* ${tipoEntrega === "delivery" ? "Delivery" : "Balcão"}\n\n`

    if (tipoEntrega === "delivery") {
      texto += "*👤 DADOS DO CLIENTE:*\n"
      texto += `Nome: ${nomeCompleto}\n`
      texto += `Telefone: ${telefone}\n\n`
      
      if (enderecoData) {
        texto += "*📍 ENDEREÇO:*\n"
        texto += `${enderecoData.logradouro}, ${numero}\n`
        if (complemento) texto += `${complemento}\n`
        texto += `${enderecoData.bairro} - ${enderecoData.localidade}/${enderecoData.uf}\n`
        texto += `CEP: ${cep}\n`
        if (observacoesEntrega) texto += `Obs. Entrega: ${observacoesEntrega}\n`
        texto += "\n"
      }
    }

    if (observacoesPedido) {
      texto += `*📝 OBSERVAÇÕES:*\n${observacoesPedido}\n\n`
    }

    const formasPagamento = {
      pix: "PIX",
      dinheiro: "Dinheiro",
      debito: "Cartão de Débito", 
      credito: "Cartão de Crédito"
    }
    texto += `*💳 FORMA DE PAGAMENTO:* ${formasPagamento[formaPagamento]}\n\n`

    const subtotal = state.total
    const taxaEntrega = tipoEntrega === "delivery" ? (config?.taxa_entrega || 0) : 0
    const total = subtotal + taxaEntrega

    texto += "*💰 RESUMO:*\n"
    texto += `Subtotal: ${formatCurrency(subtotal)}\n`
    if (tipoEntrega === "delivery") {
      texto += `Taxa de entrega: ${formatCurrency(taxaEntrega)}\n`
    }
    texto += `*Total: ${formatCurrency(total)}*\n\n`
    texto += "Aguardo confirmação! 😊"

    return texto
  }

  const handleFinalizarPedido = () => {
    const textoWhatsApp = gerarTextoWhatsApp()
    const whatsappNumber = config?.whatsapp || "5511999999999"
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(textoWhatsApp)}`
    window.open(url, "_blank")
  }

  if (!config || !isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  // Interface para carrinho vazio
  if (totalItens === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b px-4 py-3 flex items-center sticky top-0 z-10 shadow-sm">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold ml-2">Checkout</h1>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Carrinho Vazio</h2>
            <p className="text-gray-600 mb-6">
              Você ainda não adicionou nenhum item ao seu carrinho. 
              Escolha suas pizzas favoritas para continuar!
            </p>
            <Button 
              onClick={() => router.push("/")}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl"
            >
              Ver Cardápio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = state.total
  const taxaEntrega = tipoEntrega === "delivery" ? config.taxa_entrega : 0
  const total = subtotal + taxaEntrega

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center sticky top-0 z-10 shadow-sm">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Finalizar Pedido</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-4 space-y-6">
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
                        <span className="font-medium text-gray-900">🚲 Delivery</span>
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
                        <span className="font-medium text-gray-900">🏬 Balcão</span>
                        <p className="text-sm text-gray-500">Retirada no local</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* FORMULÁRIO PARA DELIVERY */}
          {tipoEntrega === "delivery" && (
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900">Dados para entrega</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <Label htmlFor="nome" className="text-sm font-medium text-gray-700 mb-2 block">
                    Nome completo *
                  </Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={nomeCompleto}
                    onChange={(e) => setNomeCompleto(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="telefone" className="text-sm font-medium text-gray-700 mb-2 block">
                    Telefone *
                  </Label>
                  <Input
                    id="telefone"
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => handleTelefoneChange(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cep" className="text-sm font-medium text-gray-700 mb-2 block">
                    CEP *
                  </Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      type="text"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="w-full pr-10"
                      required
                    />
                    {buscandoCep && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  {erroCep && (
                    <p className="text-red-600 text-sm mt-1">{erroCep}</p>
                  )}
                  {enderecoData && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-800 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span className="font-medium">Endereço encontrado:</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        {enderecoData.logradouro}, {enderecoData.bairro} - {enderecoData.localidade}/{enderecoData.uf}
                      </p>
                    </div>
                  )}
                </div>

                {enderecoData && (
                  <>
                    <div>
                      <Label htmlFor="numero" className="text-sm font-medium text-gray-700 mb-2 block">
                        Número *
                      </Label>
                      <Input
                        id="numero"
                        type="text"
                        placeholder="123"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="complemento" className="text-sm font-medium text-gray-700 mb-2 block">
                        Complemento
                      </Label>
                      <Input
                        id="complemento"
                        type="text"
                        placeholder="Apto 123, Bloco A..."
                        value={complemento}
                        onChange={(e) => setComplemento(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Label htmlFor="obs-entrega" className="text-sm font-medium text-gray-700 mb-2 block">
                        Observações para entrega
                      </Label>
                      <Textarea
                        id="obs-entrega"
                        placeholder="Ponto de referência, instruções especiais..."
                        value={observacoesEntrega}
                        onChange={(e) => setObservacoesEntrega(e.target.value)}
                        className="w-full"
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* TEXTO PARA BALCÃO */}
          {tipoEntrega === "balcao" && (
            <Card className="shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Retirada no balcão</h3>
                <p className="text-gray-600">
                  Seu pedido estará pronto para retirada em nossa loja após a confirmação.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Resumo do pedido</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4 p-4">
                {state.items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="bg-gray-50 rounded-xl p-4">
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
                ))}
              </div>
            </CardContent>
          </Card>

          {/* OBSERVAÇÕES */}
          <Card className="shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-yellow-100 pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Observações</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Textarea
                placeholder="Ex: Sem cebola, bem passado, embalagem separada..."
                value={observacoesPedido}
                onChange={(e) => setObservacoesPedido(e.target.value)}
                className="w-full"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* FORMA DE PAGAMENTO */}
          <Card className="shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 border-b border-green-100 pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900">Forma de pagamento</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <RadioGroup value={formaPagamento} onValueChange={(value: "pix" | "dinheiro" | "debito" | "credito") => setFormaPagamento(value)}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex-1 cursor-pointer">PIX</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="dinheiro" id="dinheiro" />
                    <Label htmlFor="dinheiro" className="flex-1 cursor-pointer">Dinheiro</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="debito" id="debito" />
                    <Label htmlFor="debito" className="flex-1 cursor-pointer">Cartão de Débito</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="credito" id="credito" />
                    <Label htmlFor="credito" className="flex-1 cursor-pointer">Cartão de Crédito</Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

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

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
        <div className="space-y-2">
          <Button 
            onClick={handleFinalizarPedido} 
            disabled={subtotal < config.valor_minimo || !validarFormulario()} 
            className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl shadow-lg" 
            size="lg"
          >
            {subtotal < config.valor_minimo ? (
              `Faltam ${formatCurrency(config.valor_minimo - subtotal)}`
            ) : (
              "Finalize seu Pedido"
            )}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Você será redirecionado ao WhatsApp da pizzaria para enviar seu pedido.
          </p>
        </div>
      </div>
    </div>
  )
}