"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ShoppingBag, MapPin, Phone, User, CreditCard, DollarSign, Smartphone, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/lib/cart-context"
import { formatCurrency } from "@/lib/currency-utils"
import { supabase } from "@/lib/supabase"

interface StoreConfig {
  nome: string
  whatsapp: string | null
  taxa_entrega: number
  valor_minimo: number
}

interface AddressData {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { state } = useCart()
  
  // Estados principais
  const [loading, setLoading] = useState(true)
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null)
  
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
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "dinheiro" | "debito" | "credito">("pix")
  
    // Carregar configurações da loja
  useEffect(() => {
    loadStoreConfig()
  }, [])
  
  // Verificar carrinho vazio e redirecionar se necessário
  useEffect(() => {
    if (!loading && state.items.length === 0) {
      router.push("/")
    }
  }, [state.items.length, router, loading])

  const loadStoreConfig = async () => {
    try {
      const { data } = await supabase
        .from("pizzaria_config")
        .select("nome, whatsapp, taxa_entrega, valor_minimo")
        .single()
      
      if (data) {
        setStoreConfig(data)
      } else {
        // Valores padrão se não conseguir carregar
        setStoreConfig({
          nome: "Pizzaria",
          whatsapp: "5511999999999",
          taxa_entrega: 5,
          valor_minimo: 20
        })
      }
    } catch (error) {
      // Valores padrão em caso de erro
      setStoreConfig({
        nome: "Pizzaria",
        whatsapp: "5511999999999",
        taxa_entrega: 5,
        valor_minimo: 20
      })
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
    }
    return true
  }
  
  // Gerar mensagem para WhatsApp
  const generateWhatsAppMessage = () => {
    const deliveryFee = deliveryType === "delivery" ? (storeConfig?.taxa_entrega || 0) : 0
    const subtotal = state.total
    const total = subtotal + deliveryFee
    
    let message = `🍕 *NOVO PEDIDO - ${storeConfig?.nome}*\n\n`
    
    // Resumo dos itens
    message += `📋 *ITENS DO PEDIDO:*\n`
    state.items.forEach((item, index) => {
      message += `${index + 1}. ${item.nome}\n`
      message += `   • Tamanho: ${item.tamanho}\n`
      message += `   • Quantidade: ${item.quantidade}\n`
      message += `   • Valor: ${formatCurrency(item.preco * item.quantidade)}\n\n`
    })
    
    // Tipo de entrega
    message += `🚚 *ENTREGA:* ${deliveryType === "delivery" ? "Delivery" : "Retirada no Balcão"}\n\n`
    
    // Dados do cliente (se delivery)
    if (deliveryType === "delivery") {
      message += `👤 *DADOS DO CLIENTE:*\n`
      message += `Nome: ${customerName}\n`
      message += `Telefone: ${customerPhone}\n\n`
      
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
      credito: "Cartão de Crédito"
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
  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }
  
  const subtotal = state.total
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
        {/* Resumo do Pedido */}
        <Card className="mb-4">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>
            <div className="space-y-3">
              {state.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start pb-3 border-b last:border-0">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.nome}</h3>
                    <p className="text-sm text-gray-600">
                      {item.quantidade}x {item.tamanho} • {formatCurrency(item.preco)}
                    </p>
                  </div>
                  <span className="font-semibold">{formatCurrency(item.preco * item.quantidade)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Tipo de Entrega */}
        <Card className="mb-4">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Tipo de Entrega</h2>
            <RadioGroup value={deliveryType} onValueChange={(value: "balcao" | "delivery") => setDeliveryType(value)}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="balcao" id="balcao" />
                  <Label htmlFor="balcao" className="flex-1 cursor-pointer">
                    <span className="font-medium">🏬 Retirada no Balcão</span>
                    <p className="text-sm text-gray-600">Retire seu pedido na loja</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                    <span className="font-medium">🚲 Delivery</span>
                    <p className="text-sm text-gray-600">Receba em casa (+{formatCurrency(storeConfig?.taxa_entrega || 0)})</p>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </Card>
        
        {/* Dados para Delivery */}
        {deliveryType === "delivery" && (
          <Card className="mb-4">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Dados para Entrega</h2>
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
              </div>
            </div>
          </Card>
        )}
        
        {/* Observações do Pedido */}
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
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="cursor-pointer">
                    <Smartphone className="inline w-4 h-4 mr-1" /> PIX
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="dinheiro" id="dinheiro" />
                  <Label htmlFor="dinheiro" className="cursor-pointer">
                    <DollarSign className="inline w-4 h-4 mr-1" /> Dinheiro
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="debito" id="debito" />
                  <Label htmlFor="debito" className="cursor-pointer">
                    <CreditCard className="inline w-4 h-4 mr-1" /> Débito
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="credito" id="credito" />
                  <Label htmlFor="credito" className="cursor-pointer">
                    <CreditCard className="inline w-4 h-4 mr-1" /> Crédito
                  </Label>
                </div>
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
