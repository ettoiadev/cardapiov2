"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/currency-utils"
import { CheckCircle, Clock, Package, Bike } from "lucide-react"

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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Pedidos Realizados</h1>

        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <Card key={pedido.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {pedido.tipo_entrega === "delivery" ? (
                        <Bike className="h-5 w-5 text-green-600" />
                      ) : (
                        <Package className="h-5 w-5 text-blue-600" />
                      )}
                      <span className="font-medium capitalize">{pedido.tipo_entrega}</span>
                    </div>
                    <Badge className={getStatusColor(pedido.status)}>{pedido.status}</Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{formatDate(pedido.created_at)}</span>
                    {pedido.status === "enviado" && (
                      <Button size="sm" onClick={() => handleConcluirPedido(pedido.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Concluir
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Informações do cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Cliente</h4>
                    <p className="text-sm">{pedido.clientes?.nome || "Cliente não identificado"}</p>
                    {pedido.clientes?.telefone && <p className="text-sm text-gray-600">{pedido.clientes.telefone}</p>}
                    {pedido.clientes?.email && <p className="text-sm text-gray-600">{pedido.clientes.email}</p>}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Entrega</h4>
                    {pedido.endereco_entrega ? (
                      <p className="text-sm">{pedido.endereco_entrega}</p>
                    ) : (
                      <p className="text-sm text-gray-600">Retirada no balcão</p>
                    )}
                    {pedido.forma_pagamento && (
                      <p className="text-sm text-gray-600">Pagamento: {pedido.forma_pagamento}</p>
                    )}
                  </div>
                </div>

                {/* Itens do pedido */}
                <div>
                  <h4 className="font-medium mb-2">Itens do Pedido</h4>
                  <div className="space-y-2">
                    {pedido.pedido_itens?.map((item, index) => (
                      <div key={index} className="flex justify-between items-start bg-gray-50 p-3 rounded">
                        <div>
                          <p className="font-medium">{item.nome_produto}</p>
                          {item.tamanho && <p className="text-sm text-gray-600">Tamanho: {item.tamanho}</p>}
                          {item.sabores && Array.isArray(item.sabores) && item.sabores.length > 1 && (
                            <p className="text-sm text-gray-600">Sabores: {item.sabores.join(", ")}</p>
                          )}
                          <p className="text-sm text-gray-600">Quantidade: {item.quantidade}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.preco_total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumo financeiro */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm">Subtotal: R$ {pedido.subtotal.toFixed(2)}</p>
                      {pedido.taxa_entrega > 0 && (
                        <p className="text-sm">Taxa de entrega: R$ {pedido.taxa_entrega.toFixed(2)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">Total: R$ {pedido.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {pedido.observacoes && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Observações</h4>
                    <p className="text-sm text-gray-600">{pedido.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {pedidos.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-500">Os pedidos realizados aparecerão aqui</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
