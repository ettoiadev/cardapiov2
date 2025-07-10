"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin-layout"
import { supabase } from "@/lib/supabase"
import { 
  Package, 
  BarChart3, 
  Activity,
  ChefHat,
  Settings
} from "lucide-react"

interface DashboardStats {
  totalProdutos: number
  totalCategorias: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProdutos: 0,
    totalCategorias: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Carregar estatísticas
      const [produtosRes, categoriasRes] = await Promise.all([
        supabase.from("produtos").select("id", { count: "exact" }).eq("ativo", true),
        supabase.from("categorias").select("id", { count: "exact" }).eq("ativo", true),
      ])

      const totalProdutos = produtosRes.count || 0
      const totalCategorias = categoriasRes.count || 0

      setStats({
        totalProdutos,
        totalCategorias,
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
        {/* Header Section */}
        <div className="bg-secondary rounded-2xl p-8 border border-border shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                Dashboard
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Visão geral do seu negócio com estatísticas e métricas importantes.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-foreground bg-primary px-4 py-2 rounded-lg">
              <Activity className="h-4 w-4" />
              Sistema Operacional
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0 bg-card rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">Total de Produtos</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalProdutos}</p>
                  <p className="text-xs text-muted-foreground">produtos ativos</p>
                </div>
                <div className="p-3 bg-secondary rounded-xl">
                  <Package className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-card rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">Categorias Ativas</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalCategorias}</p>
                  <p className="text-xs text-muted-foreground">categorias do cardápio</p>
                </div>
                <div className="p-3 bg-secondary rounded-xl">
                  <ChefHat className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-lg border-0 bg-card rounded-2xl overflow-hidden">
            <CardHeader className="bg-secondary border-b border-border p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <BarChart3 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Resumo do Sistema
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Principais métricas do seu negócio
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">Produtos ativos</span>
                  </div>
                  <span className="text-xl font-bold text-primary">{stats.totalProdutos}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <ChefHat className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">Categorias ativas</span>
                  </div>
                  <span className="text-xl font-bold text-primary">{stats.totalCategorias}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-card rounded-2xl overflow-hidden">
            <CardHeader className="bg-secondary border-b border-border p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <ChefHat className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    Gestão Rápida
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Principais funcionalidades do sistema
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-accent rounded-lg border border-border hover:shadow-md transition-shadow">
                  <div className="p-2 bg-muted rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Gerenciar Produtos</h3>
                    <p className="text-sm text-muted-foreground">Organize produtos e categorias do cardápio</p>
                  </div>
                </div>

                
                <div className="flex items-center gap-4 p-4 bg-accent rounded-lg border border-border hover:shadow-md transition-shadow">
                  <div className="p-2 bg-muted rounded-lg">
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Configurar Sistema</h3>
                    <p className="text-sm text-muted-foreground">Ajuste informações da pizzaria</p>
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
