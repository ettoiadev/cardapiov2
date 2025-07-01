"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ShoppingBag, MapPin, Phone, User, CreditCard, DollarSign, Smartphone, Loader2, Plus, Minus, QrCode, Banknote, UtensilsCrossed, Bike } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/currency-utils"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

interface StoreConfig {
  nome: string
  whatsapp: string | null
  taxa_entrega: number
  valor_minimo: number
  aceita_dinheiro?: boolean
  aceita_cartao?: boolean
  aceita_pix?: boolean
  aceita_ticket_alimentacao?: boolean
}

interface AddressData {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
}

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

export default function CheckoutPage() {
  const router = useRouter()
  const { state, dispatch } = useCart()
  
  // Estados principais
  const [loading, setLoading] = useState(true)
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  
  // Tipo de entrega
  const [deliveryType, setDeliveryType] = useState<"balcao" | "delivery">("balcao")
  
  // Dados do cliente
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerCep, setCep] = useState("")
  const [addressData, setAddressData] = useState<AddressData | null>(null)
  const [addressNumber, setAddressNumber] = useState("")
  const [addressComplement, setAddressComplement] = useState("")
  const [deliveryNotes, setDeliveryNotes] = useState("")
  const [searchingCep, setSearchingCep] = useState(false)
  const [cepError, setCepError] = useState("")
  
  // Observações e pagamento
  const [orderNotes, setOrderNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "dinheiro" | "debito" | "credito" | "ticket_alimentacao">("pix")
  
    // Carregar configurações da loja e produtos
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadStoreConfig(), loadProdutos()])
    }
    loadData()
  }, [])

  // Ajustar método de pagamento baseado nas configurações disponíveis
  useEffect(() => {
    if (storeConfig) {
      // Verificar se o método atual está habilitado
      const isCurrentMethodEnabled = 
        (paymentMethod === "pix" && storeConfig.aceita_pix) ||
        (paymentMethod === "dinheiro" && storeConfig.aceita_dinheiro) ||
        ((paymentMethod === "debito" || paymentMethod === "credito") && storeConfig.aceita_cartao) ||
        (paymentMethod === "ticket_alimentacao" && storeConfig.aceita_ticket_alimentacao)

      if (!isCurrentMethodEnabled) {
        // Definir o primeiro método disponível
        if (storeConfig.aceita_pix) {
          setPaymentMethod("pix")
        } else if (storeConfig.aceita_dinheiro) {
          setPaymentMethod("dinheiro")
        } else if (storeConfig.aceita_cartao) {
          setPaymentMethod("debito")
        } else if (storeConfig.aceita_ticket_alimentacao) {
          setPaymentMethod("ticket_alimentacao")
        }
      }
    }
  }, [storeConfig, paymentMethod])
  
  // Verificar carrinho vazio e redirecionar se necessário
  useEffect(() => {
    if (!loading && (!state.items || state.items.length === 0)) {
      // Aguardar um momento antes de redirecionar para evitar conflitos
      const timer = setTimeout(() => {
        router.push("/")
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [state.items?.length, router, loading])

  const loadStoreConfig = async () => {
    try {
      const { data } = await supabase
        .from("pizzaria_config")
        .select("nome, whatsapp, taxa_entrega, valor_minimo, aceita_dinheiro, aceita_cartao, aceita_pix, aceita_ticket_alimentacao")
        .single()
      
      if (data) {
        setStoreConfig(data)
      } else {
        // Valores padrão se não conseguir carregar
        setStoreConfig({
          nome: "Pizzaria",
          whatsapp: "5511999999999",
          taxa_entrega: 5,
          valor_minimo: 20,
          aceita_dinheiro: true,
          aceita_cartao: true,
          aceita_pix: true,
          aceita_ticket_alimentacao: false
        })
      }
    } catch (error) {
      // Valores padrão em caso de erro
      setStoreConfig({
        nome: "Pizzaria",
        whatsapp: "5511999999999",
        taxa_entrega: 5,
        valor_minimo: 20,
        aceita_dinheiro: true,
        aceita_cartao: true,
        aceita_pix: true,
        aceita_ticket_alimentacao: false
      })
    }
  }

  const loadProdutos = async () => {
    try {
      if (isSupabaseConfigured()) {
        const { data } = await supabase
          .from("produtos")
          .select("*")
          .eq("ativo", true)
          .order("ordem")
        
        if (data) {
          setProdutos(data)
        }
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    } finally {
      setLoading(false)
    }
  }
  
  // Buscar CEP
  const searchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, "")
    
    if (cleanCep.length !== 8) {
      setCepError("CEP deve ter 8 dígitos")
      return
    }
    
    setSearchingCep(true)
    setCepError("")
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await response.json()
      
      if (data.erro) {
        setCepError("CEP não encontrado")
        setAddressData(null)
      } else {
        setAddressData(data)
        setCepError("")
      }
    } catch (error) {
      setCepError("Erro ao buscar CEP")
      setAddressData(null)
    } finally {
      setSearchingCep(false)
    }
  }
  
  // Máscara de CEP
  const handleCepChange = (value: string) => {
    const masked = value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9)
    
    setCep(masked)
    
    if (masked.replace(/\D/g, "").length === 8) {
      searchCep(masked)
    } else {
      setAddressData(null)
      setCepError("")
    }
  }
  
  // Máscara de telefone
  const handlePhoneChange = (value: string) => {
    const masked = value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15)
    
    setCustomerPhone(masked)
  }
  
  // Validar formulário
  const isFormValid = () => {
    if (deliveryType === "delivery") {
      return (
        customerName.trim() !== "" &&
        customerPhone.replace(/\D/g, "").length >= 10 &&
        customerCep.replace(/\D/g, "").length === 8 &&
        addressData !== null &&
        addressNumber.trim() !== ""
      )
    } else {
      // Para retirada no balcão: apenas nome e telefone são obrigatórios
      return (
        customerName.trim() !== "" &&
        customerPhone.replace(/\D/g, "").length >= 10
      )
    }
  }
  
  // Gerar mensagem para WhatsApp
  const generateWhatsAppMessage = () => {
    const deliveryFee = deliveryType === "delivery" ? (storeConfig?.taxa_entrega || 0) : 0
    const subtotal = state.total
    const total = subtotal + deliveryFee
    
    let message = `🍕 *NOVO PEDIDO - ${storeConfig?.nome}*\n\n`
    
    // Resumo dos itens
    message += `📋 *ITENS DO PEDIDO:*\n`
    state.items?.forEach((item, index) => {
      message += `${index + 1}. ${item.nome}\n`
      message += `   • Tamanho: ${item.tamanho}\n`
      
      // Mostrar sabores se for pizza com múltiplos sabores
      if (item.sabores && item.sabores.length > 0) {
        if (item.sabores.length === 1) {
          message += `   • Sabor: ${item.sabores[0]}\n`
        } else {
          message += `   • Sabores: ${item.sabores.join(', ')}\n`
        }
      }
      
      // Mostrar adicionais se existirem, organizados por sabor
      if (item.adicionais && item.adicionais.length > 0) {
        item.adicionais.forEach((adicionalGrupo) => {
          if (adicionalGrupo.itens.length > 0) {
            message += `   • Adicionais (${adicionalGrupo.sabor}): ${adicionalGrupo.itens.map(adic => `${adic.nome} (+${formatCurrency(adic.preco)})`).join(', ')}\n`
          }
        })
      }
      
      message += `   • Quantidade: ${item.quantidade}\n`
      message += `   • Valor: ${formatCurrency(item.preco * item.quantidade)}\n\n`
    })
    
    // Tipo de entrega
          message += `🏍️ *ENTREGA:* ${deliveryType === "delivery" ? "Delivery" : "Retirada no Balcão"}\n\n`
    
    // Dados do cliente
    message += `👤 *DADOS DO CLIENTE:*\n`
    message += `Nome: ${customerName}\n`
    message += `Telefone: ${customerPhone}\n\n`
    
    // Dados do cliente (se delivery)
    if (deliveryType === "delivery") {
      message += `📍 *ENDEREÇO DE ENTREGA:*\n`
      if (addressData) {
        message += `${addressData.logradouro}, ${addressNumber}\n`
        if (addressComplement) message += `${addressComplement}\n`
        message += `${addressData.bairro} - ${addressData.localidade}/${addressData.uf}\n`
        message += `CEP: ${customerCep}\n`
        if (deliveryNotes) message += `Observações: ${deliveryNotes}\n`
      }
      message += `\n`
    }
    
    // Observações do pedido
    if (orderNotes) {
      message += `📝 *OBSERVAÇÕES DO PEDIDO:*\n${orderNotes}\n\n`
    }
    
    // Forma de pagamento
    const paymentLabels = {
      pix: "PIX",
      dinheiro: "Dinheiro",
      debito: "Cartão de Débito",
      credito: "Cartão de Crédito",
      ticket_alimentacao: "Ticket Alimentação"
    }
    message += `💳 *FORMA DE PAGAMENTO:* ${paymentLabels[paymentMethod]}\n\n`
    
    // Resumo financeiro
    message += `💰 *VALORES:*\n`
    message += `Subtotal: ${formatCurrency(subtotal)}\n`
    if (deliveryType === "delivery") {
      message += `Taxa de entrega: ${formatCurrency(deliveryFee)}\n`
    }
    message += `*TOTAL: ${formatCurrency(total)}*\n\n`
    
    message += `✅ Aguardo confirmação!`
    
    return message
  }
  
  // Buscar adicionais de um sabor específico
  const getAdicionaisForSabor = (saborNome: string): Adicional[] => {
    const produto = produtos.find(p => p.nome === saborNome)
    return produto?.adicionais || []
  }

  // Atualizar adicionais de um item do carrinho
  const handleToggleAdicional = (itemId: string, sabor: string, adicional: Adicional, checked: boolean) => {
    const item = state.items.find(i => i.id === itemId)
    if (!item) return

    let newAdicionais = item.adicionais || []

    // Encontrar ou criar grupo de adicionais para este sabor
    const saborIndex = newAdicionais.findIndex(a => a.sabor === sabor)

    if (saborIndex >= 0) {
      // Grupo existe, modificar lista de itens
      const currentItens = newAdicionais[saborIndex].itens
      
      if (checked) {
        // Adicionar se não existir
        if (!currentItens.some(i => i.nome === adicional.nome)) {
          newAdicionais[saborIndex].itens = [...currentItens, adicional]
        }
      } else {
        // Remover se existir
        newAdicionais[saborIndex].itens = currentItens.filter(i => i.nome !== adicional.nome)
      }
    } else if (checked) {
      // Criar novo grupo se não existir e estamos adicionando
      newAdicionais.push({
        sabor,
        itens: [adicional]
      })
    }

    // Filtrar grupos vazios
    newAdicionais = newAdicionais.filter(grupo => grupo.itens.length > 0)

    // Atualizar item no carrinho (o contexto recalcula o preço automaticamente)
    dispatch({
      type: "UPDATE_ADICIONAIS",
      payload: {
        id: itemId,
        adicionais: newAdicionais
      }
    })
  }

  // Finalizar pedido
  const handleFinishOrder = () => {
    const message = generateWhatsAppMessage()
    const whatsappNumber = storeConfig?.whatsapp || "5511999999999"
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, "_blank")
  }
  
  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }
  
  // Se carrinho estiver vazio, mostrar loading (redirecionamento será feito no useEffect)
  if (!state.items || state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }
  
  const subtotal = state.total || 0
  const deliveryFee = deliveryType === "delivery" ? (storeConfig?.taxa_entrega || 0) : 0
  const total = subtotal + deliveryFee
  const minimumValue = storeConfig?.valor_minimo || 0
  const isMinimumMet = subtotal >= minimumValue
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold ml-2">Finalizar Pedido</h1>
      </div>
      
      <div className="max-w-2xl mx-auto p-4 pb-24">
        {/* Tipo de Entrega */}
        <Card className="mb-4">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-6 text-foreground">Tipo de Entrega</h2>
            <RadioGroup value={deliveryType} onValueChange={(value: "balcao" | "delivery") => setDeliveryType(value)}>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`relative p-6 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer bg-white ${
                    deliveryType === "balcao" 
                      ? "border border-orange-400 bg-orange-50 ring-2 ring-orange-100" 
                      : "border border-gray-200 hover:border-orange-300"
                  }`}
                  onClick={() => setDeliveryType("balcao")}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-black text-white rounded-full p-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-base text-gray-900 block">Retirada no Balcão</span>
                      <p className="text-sm text-gray-500 mt-1">Retire seu pedido na loja</p>
                    </div>
                  </div>
                  <RadioGroupItem value="balcao" id="balcao" className="sr-only" />
                </div>
                <div 
                  className={`relative p-6 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg cursor-pointer bg-white ${
                    deliveryType === "delivery" 
                      ? "border border-blue-400 bg-blue-50 ring-2 ring-blue-100" 
                      : "border border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => setDeliveryType("delivery")}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="bg-black text-white rounded-full p-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-semibold text-base text-gray-900 block">Delivery</span>
                      <p className="text-sm text-gray-500 mt-1">Receba em casa (+{formatCurrency(storeConfig?.taxa_entrega || 0)})</p>
                    </div>
                  </div>
                  <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                </div>
              </div>
            </RadioGroup>
          </div>
        </Card>
        
        {/* Dados do Cliente sempre primeiro */}
        <Card className="mb-4">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              {deliveryType === "delivery" ? "Dados para Entrega" : "Dados do Cliente"}
            </h2>
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    placeholder="Seu nome completo"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              {/* Telefone */}
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={customerPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              {/* Campos específicos para Delivery */}
              {deliveryType === "delivery" && (
                <>
                  {/* CEP */}
                  <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        value={customerCep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        className="pl-10"
                        required
                      />
                      {searchingCep && (
                        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                      )}
                    </div>
                    {cepError && <p className="text-red-600 text-sm mt-1">{cepError}</p>}
                    {addressData && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg text-sm">
                        <p className="font-medium text-green-800">Endereço encontrado:</p>
                        <p className="text-green-700">
                          {addressData.logradouro}, {addressData.bairro} - {addressData.localidade}/{addressData.uf}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Campos adicionais após CEP */}
                  {addressData && (
                    <>
                      <div>
                        <Label htmlFor="number">Número *</Label>
                        <Input
                          id="number"
                          placeholder="123"
                          value={addressNumber}
                          onChange={(e) => setAddressNumber(e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                          id="complement"
                          placeholder="Apto 101, Bloco A..."
                          value={addressComplement}
                          onChange={(e) => setAddressComplement(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="delivery-notes">Observações de Entrega</Label>
                        <Textarea
                          id="delivery-notes"
                          placeholder="Ponto de referência, instruções..."
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>
        
        {/* Resumo do Pedido sempre segundo */}
        <Card className="mb-4">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>
            <div className="space-y-3">
              {state.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-start pb-3 border-b last:border-0">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.nome}</h3>
                    <p className="text-sm text-gray-600">
                      {item.quantidade}x {item.tamanho} • {formatCurrency(item.preco)}
                    </p>
                    
                    {/* Seção de Adicionais Editáveis por Sabor */}
                    {item.sabores && item.sabores.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {item.sabores.map((sabor, saborIndex) => {
                          const adicionaisDisponiveis = getAdicionaisForSabor(sabor)
                          if (adicionaisDisponiveis.length === 0) return null
                          
                          return (
                            <div key={saborIndex} className="bg-gray-50 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-gray-600 border-b border-gray-200 pb-1 mb-2">Opcionais:</h4>
                              <div className="space-y-2">
                                {adicionaisDisponiveis.map((adicional, adIndex) => (
                                  <div key={adIndex} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${item.id}-${sabor}-${adicional.nome}`}
                                        checked={item.adicionais?.find(a => a.sabor === sabor)?.itens.some(i => i.nome === adicional.nome) || false}
                                        onCheckedChange={(checked) => 
                                          handleToggleAdicional(item.id, sabor, adicional, checked as boolean)
                                        }
                                      />
                                      <Label 
                                        htmlFor={`${item.id}-${sabor}-${adicional.nome}`}
                                        className="cursor-pointer text-sm flex-1"
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
                        })}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold">{formatCurrency(item.preco * item.quantidade)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Observações do Pedido (sempre na mesma posição) */}
        <Card className="mb-4">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Observações do Pedido</h2>
            <Textarea
              placeholder="Ex: Sem cebola, bem passado..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={3}
            />
          </div>
        </Card>
        
        {/* Forma de Pagamento */}
        <Card className="mb-4">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Forma de Pagamento</h2>
            <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <div className="grid grid-cols-2 gap-3">
                {storeConfig?.aceita_pix && (
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="cursor-pointer flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-blue-600" />
                      PIX
                    </Label>
                  </div>
                )}
                {storeConfig?.aceita_dinheiro && (
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="dinheiro" id="dinheiro" />
                    <Label htmlFor="dinheiro" className="cursor-pointer flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-green-600" />
                      Dinheiro
                    </Label>
                  </div>
                )}
                {storeConfig?.aceita_cartao && (
                  <>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="debito" id="debito" />
                      <Label htmlFor="debito" className="cursor-pointer flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-purple-600" />
                        Cartão de Débito
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="credito" id="credito" />
                      <Label htmlFor="credito" className="cursor-pointer flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-orange-600" />
                        Cartão de Crédito
                      </Label>
                    </div>
                  </>
                )}
                {storeConfig?.aceita_ticket_alimentacao && (
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="ticket_alimentacao" id="ticket_alimentacao" />
                    <Label htmlFor="ticket_alimentacao" className="cursor-pointer flex items-center gap-2">
                      <UtensilsCrossed className="h-4 w-4 text-amber-600" />
                      Ticket Alimentação
                    </Label>
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>
        </Card>
        
        {/* Resumo de Valores */}
        <Card className="mb-4">
          <div className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {deliveryType === "delivery" && (
                <div className="flex justify-between">
                  <span>Taxa de entrega</span>
                  <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                <span>Total</span>
                <span className="text-green-600">{formatCurrency(total)}</span>
              </div>
            </div>
            
            {!isMinimumMet && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  Valor mínimo: {formatCurrency(minimumValue)}
                  <br />
                  Faltam {formatCurrency(minimumValue - subtotal)} para atingir o mínimo
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
      
      {/* Botão Fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <Button
          onClick={handleFinishOrder}
          disabled={!isMinimumMet || !isFormValid()}
          className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
        >
          Finalize seu Pedido
        </Button>
        <p className="text-xs text-gray-500 text-center mt-2">
          Você será redirecionado ao WhatsApp da pizzaria
        </p>
      </div>
    </div>
  )
}
