"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/currency-utils"
import { 
  CheckCircle, 
  Clock, 
  Package, 
  Bike, 
  FileText,
  User,
  MapPin,
  CreditCard,
  ShoppingBag,
  Calendar,
  DollarSign
} from "lucide-react"

interface Pedido {
  id: string
  cliente_id: string | null
  tipo_entrega: string
  endereco_entrega: string | null
  forma_pagamento: string | null
  subtotal: number
  taxa_entrega: number
  total: number
  status: string
  observacoes: string | null
  enviado_whatsapp: boolean
  created_at: string
  clientes?: {
    nome: string
    telefone: string | null
    email: string | null
  }
  pedido_itens?: Array<{
    nome_produto: string
    tamanho: string | null
    sabores: any
    quantidade: number
    preco_total: number
  }>
}

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPedidos()
  }, [])

  const loadPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          *,
          clientes (nome, telefone, email),
          pedido_itens (nome_produto, tamanho, sabores, quantidade, preco_total)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao carregar pedidos:", error)
        return
      }

      if (data) {
        setPedidos(data)
      }
    } catch (error) {
      console.error("Erro ao conectar com Supabase:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConcluirPedido = async (pedidoId: string) => {
    try {
      const { error } = await supabase.from("pedidos").update({ status: "concluido" }).eq("id", pedidoId)

      if (error) {
        console.error("Erro ao concluir pedido:", error)
        return
      }

      loadPedidos()
    } catch (error) {
      console.error("Erro ao concluir pedido:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "enviado":
        return "bg-blue-100 text-blue-800"
      case "concluido":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-64">Carregando pedidos...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-8 border border-purple-100 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-600" />
                Pedidos Realizados
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Acompanhe todos os pedidos realizados pelos clientes, gerencie status e monitore o faturamento.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-100 px-4 py-2 rounded-lg">
              <ShoppingBag className="h-4 w-4" />
              {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} total
            </div>
          </div>
        </div>

        {/* Orders List */}
        {pedidos.length > 0 ? (
          <div className="space-y-6">
            {pedidos.map((pedido) => (
              <Card key={pedido.id} className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        {pedido.tipo_entrega === "delivery" ? (
                          <Bike className="h-6 w-6 text-green-600" />
                        ) : (
                          <Package className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">
                            {pedido.tipo_entrega}
                          </h3>
                          <Badge 
                            className={`${getStatusColor(pedido.status)} px-3 py-1 text-xs font-medium rounded-full`}
                          >
                            {pedido.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(pedido.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(pedido.total)}</p>
                        <p className="text-xs text-gray-500">Total do pedido</p>
                      </div>
                      {pedido.status === "enviado" && (
                        <Button 
                          size="lg" 
                          onClick={() => handleConcluirPedido(pedido.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl"
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Customer & Delivery Info */}
                    <div className="space-y-6">
                      {/* Customer Information */}
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Informações do Cliente</h4>
                        </div>
                        <div className="space-y-2">
                          <p className="font-medium text-gray-900">
                            {pedido.clientes?.nome || "Cliente não identificado"}
                          </p>
                          {pedido.clientes?.telefone && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              📱 {pedido.clientes.telefone}
                            </p>
                          )}
                          {pedido.clientes?.email && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              ✉️ {pedido.clientes.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Delivery Information */}
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Entrega</h4>
                        </div>
                        <div className="space-y-2">
                          {pedido.endereco_entrega ? (
                            <p className="text-sm text-gray-700">{pedido.endereco_entrega}</p>
                          ) : (
                            <p className="text-sm text-gray-600 italic">Retirada no balcão</p>
                          )}
                          {pedido.forma_pagamento && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Pagamento: {pedido.forma_pagamento}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items & Financial Summary */}
                    <div className="space-y-6">
                      {/* Order Items */}
                      <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <ShoppingBag className="h-5 w-5 text-orange-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Itens do Pedido</h4>
                        </div>
                        <div className="space-y-3">
                          {pedido.pedido_itens?.map((item, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 border border-orange-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{item.nome_produto}</p>
                                  {item.tamanho && (
                                    <p className="text-sm text-gray-600">📏 Tamanho: {item.tamanho}</p>
                                  )}
                                  {item.sabores && Array.isArray(item.sabores) && item.sabores.length > 1 && (
                                    <p className="text-sm text-gray-600">🍕 Sabores: {item.sabores.join(", ")}</p>
                                  )}
                                  <p className="text-sm text-gray-600">📦 Quantidade: {item.quantidade}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-green-600">{formatCurrency(item.preco_total)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-gray-900">Resumo Financeiro</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Subtotal:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(pedido.subtotal)}</span>
                          </div>
                          {pedido.taxa_entrega > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Taxa de entrega:</span>
                              <span className="font-medium text-gray-900">{formatCurrency(pedido.taxa_entrega)}</span>
                            </div>
                          )}
                          <div className="border-t border-green-200 pt-2 mt-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900">Total:</span>
                              <span className="text-xl font-bold text-green-600">{formatCurrency(pedido.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Observations */}
                  {pedido.observacoes && (
                    <div className="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <FileText className="h-4 w-4 text-yellow-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Observações</h4>
                      </div>
                      <p className="text-sm text-gray-700 italic">{pedido.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Nenhum pedido encontrado
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Os pedidos realizados pelos clientes aparecerão aqui para você acompanhar e gerenciar.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
