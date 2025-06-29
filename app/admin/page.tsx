"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin-layout"
import { supabase } from "@/lib/supabase"
import { 
  Package, 
  Users, 
  BarChart3, 
  Activity,
  ChefHat
} from "lucide-react"

interface DashboardStats {
  totalProdutos: number
  totalClientes: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProdutos: 0,
    totalClientes: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Carregar estatísticas
      const [produtosRes, clientesRes] = await Promise.all([
        supabase.from("produtos").select("id", { count: "exact" }).eq("ativo", true),
        supabase.from("clientes").select("id", { count: "exact" }),
      ])

      const totalProdutos = produtosRes.count || 0
      const totalClientes = clientesRes.count || 0

      setStats({
        totalProdutos,
        totalClientes,
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Dashboard
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Visão geral do seu negócio com estatísticas e métricas importantes para acompanhar o desempenho.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-100 px-4 py-2 rounded-lg">
              <Activity className="h-4 w-4" />
              Sistema Operacional
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-orange-600">Total de Produtos</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProdutos}</p>
                  <p className="text-xs text-orange-500">produtos ativos</p>
                </div>
                <div className="p-3 bg-orange-200 rounded-xl">
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-600">Total de Clientes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalClientes}</p>
                  <p className="text-xs text-blue-500">clientes cadastrados</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-xl">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Resumo do Sistema
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Principais métricas do seu negócio
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-gray-900">Produtos ativos</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">{stats.totalProdutos}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Clientes cadastrados</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{stats.totalClientes}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <ChefHat className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Gestão Rápida
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Principais funcionalidades do sistema
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                  <div className="p-2 bg-orange-200 rounded-lg">
                    <Package className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gerenciar Produtos</h3>
                    <p className="text-sm text-gray-600">Organize produtos e categorias do cardápio</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Visualizar Clientes</h3>
                    <p className="text-sm text-gray-600">Acompanhe clientes cadastrados</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <Activity className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Configurar Sistema</h3>
                    <p className="text-sm text-gray-600">Ajuste informações da pizzaria</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
