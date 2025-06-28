"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin-layout"
import { supabase } from "@/lib/supabase"
import { Package, Users, FileText, DollarSign } from "lucide-react"

interface DashboardStats {
  totalProdutos: number
  totalClientes: number
  totalPedidos: number
  faturamentoMes: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProdutos: 0,
    totalClientes: 0,
    totalPedidos: 0,
    faturamentoMes: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Carregar estatísticas
      const [produtosRes, clientesRes, pedidosRes] = await Promise.all([
        supabase.from("produtos").select("id", { count: "exact" }).eq("ativo", true),
        supabase.from("clientes").select("id", { count: "exact" }),
        supabase.from("pedidos").select("total"),
      ])

      const totalProdutos = produtosRes.count || 0
      const totalClientes = clientesRes.count || 0
      const totalPedidos = pedidosRes.data?.length || 0
      const faturamentoMes = pedidosRes.data?.reduce((sum, pedido) => sum + pedido.total, 0) || 0

      setStats({
        totalProdutos,
        totalClientes,
        totalPedidos,
        faturamentoMes,
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProdutos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClientes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPedidos}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ {stats.faturamentoMes.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo rápido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Produtos ativos:</span>
                <span className="font-medium">{stats.totalProdutos}</span>
              </div>
              <div className="flex justify-between">
                <span>Clientes cadastrados:</span>
                <span className="font-medium">{stats.totalClientes}</span>
              </div>
              <div className="flex justify-between">
                <span>Pedidos realizados:</span>
                <span className="font-medium">{stats.totalPedidos}</span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="font-medium">Faturamento total:</span>
                <span className="font-bold text-green-600">R$ {stats.faturamentoMes.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <p>• Gerencie produtos e categorias</p>
                <p>• Visualize clientes cadastrados</p>
                <p>• Acompanhe pedidos realizados</p>
                <p>• Configure informações da pizzaria</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
