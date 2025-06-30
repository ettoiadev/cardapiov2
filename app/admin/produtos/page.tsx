"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from "@/lib/currency-utils"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Tag, 
  Settings2, 
  Pizza, 
  Coffee,
  Utensils,
  Eye,
  EyeOff,
  MoreVertical,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Filter,
  Search
} from "lucide-react"

interface Produto {
  id: string
  categoria_id: string | null
  nome: string
  descricao: string | null
  preco_tradicional: number | null
  preco_broto: number | null
  tipo: string
  ativo: boolean
  ordem: number
}

interface Categoria {
  id: string
  nome: string
  descricao?: string | null
  ordem?: number
  ativo?: boolean
}

interface OpcaoSabor {
  id: string
  nome: string
  maximo_sabores: number
  ativo: boolean
}

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [opcoesSabores, setOpcoesSabores] = useState<OpcaoSabor[]>([])
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)
  const [isCategoriaDialogOpen, setIsCategoriaDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [produtosRes, categoriasRes, opcoesRes] = await Promise.all([
        supabase.from("produtos").select("*").order("ordem"),
        supabase.from("categorias").select("*").order("ordem"),
        supabase.from("opcoes_sabores").select("*").order("ordem"),
      ])

      if (produtosRes.data) setProdutos(produtosRes.data)
      if (categoriasRes.data) setCategorias(categoriasRes.data)
      if (opcoesRes.data) setOpcoesSabores(opcoesRes.data)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      // Fallback para opcoes mock
      setOpcoesSabores([
        { id: "1", nome: "1 Sabor", maximo_sabores: 1, ativo: true },
        { id: "2", nome: "2 Sabores", maximo_sabores: 2, ativo: true },
        { id: "3", nome: "3 Sabores", maximo_sabores: 3, ativo: true }
      ])
    }
  }

  const handleSave = async (produto: Partial<Produto>) => {
    try {
      if (editingProduto?.id) {
        // Atualizar
        const { error } = await supabase.from("produtos").update(produto).eq("id", editingProduto.id)
        if (error) throw error
      } else {
        // Criar novo
        const { error } = await supabase.from("produtos").insert(produto)
        if (error) throw error
      }

      loadData()
      setIsDialogOpen(false)
      setEditingProduto(null)
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        const { error } = await supabase.from("produtos").delete().eq("id", id)
        if (error) throw error
        loadData()
      } catch (error) {
        console.error("Erro ao excluir produto:", error)
      }
    }
  }

  const handleToggleOpcaoSabor = async (opcaoId: string, novoStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("opcoes_sabores")
        .update({ ativo: novoStatus })
        .eq("id", opcaoId)
      
      if (error) throw error
      
      // Atualizar estado local
      setOpcoesSabores(prev => 
        prev.map(opcao => 
          opcao.id === opcaoId ? { ...opcao, ativo: novoStatus } : opcao
        )
      )
    } catch (error) {
      console.error("Erro ao atualizar opcao de sabor:", error)
    }
  }

  const handleSaveCategoria = async (categoria: Partial<Categoria>) => {
    try {
      if (editingCategoria?.id) {
        // Atualizar categoria existente
        const { error } = await supabase.from("categorias").update(categoria).eq("id", editingCategoria.id)
        if (error) throw error
      } else {
        // Criar nova categoria
        const { error } = await supabase.from("categorias").insert(categoria)
        if (error) throw error
      }

      await loadData()
      setIsCategoriaDialogOpen(false)
      setEditingCategoria(null)
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
      alert("Erro ao salvar categoria. Tente novamente.")
    }
  }

  const handleDeleteCategoria = async (id: string) => {
    try {
      // Verificar se existem produtos usando esta categoria
      const { data: produtosComCategoria, error: checkError } = await supabase
        .from("produtos")
        .select("id, nome")
        .eq("categoria_id", id)
      
      if (checkError) throw checkError

      if (produtosComCategoria && produtosComCategoria.length > 0) {
        const nomesProdutos = produtosComCategoria.map(p => p.nome).join(", ")
        const confirmacao = confirm(
          `Esta categoria possui ${produtosComCategoria.length} produto(s) associado(s): ${nomesProdutos}.\n\n` +
          `Ao excluir a categoria, estes produtos ficarão sem categoria.\n\n` +
          `Deseja continuar?`
        )
        
        if (!confirmacao) return

        // Remover a categoria dos produtos antes de excluir
        const { error: updateError } = await supabase
          .from("produtos")
          .update({ categoria_id: null })
          .eq("categoria_id", id)
        
        if (updateError) throw updateError
      } else {
        const confirmacao = confirm("Tem certeza que deseja excluir esta categoria?")
        if (!confirmacao) return
      }

      // Excluir a categoria
      const { error } = await supabase.from("categorias").delete().eq("id", id)
      if (error) throw error

      await loadData()
    } catch (error) {
      console.error("Erro ao excluir categoria:", error)
      alert("Erro ao excluir categoria. Tente novamente.")
    }
  }

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Função para organizar produtos por categoria com prioridade
  const organizeProductsByCategory = () => {
    const pizzasCategories = ['salgada', 'doce']
    const pizzas = filteredProdutos.filter(produto => pizzasCategories.includes(produto.tipo))
    const bebidas = filteredProdutos.filter(produto => produto.tipo === 'bebida')
    const outros = filteredProdutos.filter(produto => !pizzasCategories.includes(produto.tipo) && produto.tipo !== 'bebida')
    
    // Adicionar numeração sequencial para pizzas
    const pizzasComNumeracao = pizzas.map((pizza, index) => ({
      ...pizza,
      numeroSequencial: String(index + 1).padStart(2, '0')
    }))

    return {
      pizzas: pizzasComNumeracao,
      bebidas,
      outros
    }
  }

  const { pizzas, bebidas, outros } = organizeProductsByCategory()

  const getProductIcon = (tipo: string) => {
    switch (tipo) {
      case 'pizza':
      case 'salgada':
        return <Pizza className="h-5 w-5 text-orange-500" />
      case 'doce':
        return <Utensils className="h-5 w-5 text-pink-500" />
      case 'bebida':
        return <Coffee className="h-5 w-5 text-blue-500" />
      default:
        return <Package className="h-5 w-5 text-gray-500" />
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
                <Package className="h-8 w-8 text-blue-600" />
                Gerenciamento de Produtos
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Gerencie produtos, categorias e configurações de sabores do seu cardápio digital.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    onClick={() => {
                      setEditingProduto(null)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                      {editingProduto ? "Editar Produto" : "Novo Produto"}
                    </DialogTitle>
                  </DialogHeader>
                  <ProdutoForm
                    produto={editingProduto}
                    categorias={categorias}
                    onSave={handleSave}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Management Sections Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Categories Management */}
          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Tag className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Categorias
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Organize seus produtos por categorias
                    </p>
                  </div>
                </div>
                <Dialog open={isCategoriaDialogOpen} onOpenChange={setIsCategoriaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-green-200 text-green-700 hover:bg-green-50 rounded-lg"
                      onClick={() => {
                        setEditingCategoria(null)
                        setIsCategoriaDialogOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">
                        {editingCategoria ? "Editar Categoria" : "Nova Categoria"}
                      </DialogTitle>
                    </DialogHeader>
                    <CategoriaForm
                      categoria={editingCategoria}
                      onSave={handleSaveCategoria}
                      onCancel={() => setIsCategoriaDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {categorias.length > 0 ? (
                  <div className="grid gap-4">
                    {categorias.map((categoria) => (
                      <div 
                        key={categoria.id} 
                        className="group bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-gray-900">{categoria.nome}</h3>
                              <Badge variant={categoria.ativo ? "default" : "secondary"} className="text-xs">
                                {categoria.ativo ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                            {categoria.descricao && (
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {categoria.descricao}
                              </p>
                            )}
                            <div className="flex items-center gap-6 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <ArrowUpDown className="h-3 w-3" />
                                Ordem: {categoria.ordem || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {produtos.filter(p => p.categoria_id === categoria.id).length} produtos
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-600"
                              onClick={() => {
                                setEditingCategoria(categoria)
                                setIsCategoriaDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                              onClick={() => handleDeleteCategoria(categoria.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma categoria</h3>
                    <p className="text-gray-500 mb-4">Crie sua primeira categoria para organizar os produtos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Flavor Options Management */}
          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Configurações de Sabores
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Controle as opções de sabores disponíveis
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {opcoesSabores.map((opcao) => (
                  <div 
                    key={opcao.id} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Pizza className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-gray-900">{opcao.nome}</span>
                          {opcao.maximo_sabores === 1 && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              Obrigatório
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Até {opcao.maximo_sabores} sabor{opcao.maximo_sabores > 1 ? 'es' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {opcao.ativo ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600">
                          {opcao.ativo ? "Habilitado" : "Desabilitado"}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={opcao.ativo}
                          disabled={opcao.maximo_sabores === 1} // 1 sabor sempre habilitado
                          onChange={(e) => handleToggleOpcaoSabor(opcao.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products List Section */}
        <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Package className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Lista de Produtos
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredProdutos.length} produto{filteredProdutos.length !== 1 ? 's' : ''} encontrado{filteredProdutos.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 rounded-lg border-gray-200 focus:border-orange-300 focus:ring-orange-200"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {filteredProdutos.length > 0 ? (
              <div className="space-y-8">
                {/* Seção de Pizzas */}
                {pizzas.length > 0 && (
                  <div>
                    <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-4 mb-6 border border-orange-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-200 rounded-lg">
                          <Pizza className="h-6 w-6 text-orange-700" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-orange-900">Pizzas</h2>
                          <p className="text-sm text-orange-700">{pizzas.length} pizza{pizzas.length !== 1 ? 's' : ''} cadastrada{pizzas.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {pizzas.map((produto) => (
                        <div
                          key={produto.id}
                          className="group bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-orange-200"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {getProductIcon(produto.tipo)}
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                                  <span className="inline-block bg-orange-200 text-orange-800 text-sm font-bold px-2 py-1 rounded-md mr-2">
                                    {produto.numeroSequencial}
                                  </span>
                                  {produto.nome}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant={produto.ativo ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {produto.ativo ? "Ativo" : "Inativo"}
                                  </Badge>
                                  <span className="text-xs text-gray-500 capitalize">
                                    {produto.tipo}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-600"
                                onClick={() => {
                                  setEditingProduto(produto)
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                                onClick={() => handleDelete(produto.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {produto.descricao && (
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                              {produto.descricao}
                            </p>
                          )}

                          <div className="space-y-3">
                            <div className="bg-white rounded-lg p-3 border border-orange-100">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 flex items-center gap-2">
                                  <Pizza className="h-4 w-4" />
                                  Tradicional
                                </span>
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(produto.preco_tradicional)}
                                </span>
                              </div>
                              {produto.preco_broto && (
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-orange-100">
                                  <span className="text-sm text-gray-600 flex items-center gap-2">
                                    <Pizza className="h-3 w-3" />
                                    Broto
                                  </span>
                                  <span className="font-semibold text-green-600">
                                    {formatCurrency(produto.preco_broto)}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <ArrowUpDown className="h-3 w-3" />
                                Ordem: {produto.ordem}
                              </span>
                              {produto.categoria_id && (
                                <span className="flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  {categorias.find(c => c.id === produto.categoria_id)?.nome || 'Sem categoria'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seção de Bebidas */}
                {bebidas.length > 0 && (
                  <div>
                    <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-4 mb-6 border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-200 rounded-lg">
                          <Coffee className="h-6 w-6 text-blue-700" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-blue-900">Bebidas</h2>
                          <p className="text-sm text-blue-700">{bebidas.length} bebida{bebidas.length !== 1 ? 's' : ''} cadastrada{bebidas.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {bebidas.map((produto) => (
                        <div
                          key={produto.id}
                          className="group bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {getProductIcon(produto.tipo)}
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                                  {produto.nome}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant={produto.ativo ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {produto.ativo ? "Ativo" : "Inativo"}
                                  </Badge>
                                  <span className="text-xs text-gray-500 capitalize">
                                    {produto.tipo}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-600"
                                onClick={() => {
                                  setEditingProduto(produto)
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                                onClick={() => handleDelete(produto.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {produto.descricao && (
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                              {produto.descricao}
                            </p>
                          )}

                          <div className="space-y-3">
                            <div className="bg-white rounded-lg p-3 border border-blue-100">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 flex items-center gap-2">
                                  <Coffee className="h-4 w-4" />
                                  Preço
                                </span>
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(produto.preco_tradicional)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <ArrowUpDown className="h-3 w-3" />
                                Ordem: {produto.ordem}
                              </span>
                              {produto.categoria_id && (
                                <span className="flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  {categorias.find(c => c.id === produto.categoria_id)?.nome || 'Sem categoria'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seção de Outras Categorias */}
                {outros.length > 0 && (
                  <div>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6 border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-200 rounded-lg">
                          <Package className="h-6 w-6 text-purple-700" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-purple-900">Outras Categorias</h2>
                          <p className="text-sm text-purple-700">{outros.length} produto{outros.length !== 1 ? 's' : ''} cadastrado{outros.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {outros.map((produto) => (
                        <div
                          key={produto.id}
                          className="group bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-purple-200"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              {getProductIcon(produto.tipo)}
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                                  {produto.nome}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant={produto.ativo ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {produto.ativo ? "Ativo" : "Inativo"}
                                  </Badge>
                                  <span className="text-xs text-gray-500 capitalize">
                                    {produto.tipo}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-blue-50 text-blue-600"
                                onClick={() => {
                                  setEditingProduto(produto)
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                                onClick={() => handleDelete(produto.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {produto.descricao && (
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                              {produto.descricao}
                            </p>
                          )}

                          <div className="space-y-3">
                            <div className="bg-white rounded-lg p-3 border border-purple-100">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 flex items-center gap-2">
                                  <Package className="h-4 w-4" />
                                  Preço
                                </span>
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(produto.preco_tradicional)}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <ArrowUpDown className="h-3 w-3" />
                                Ordem: {produto.ordem}
                              </span>
                              {produto.categoria_id && (
                                <span className="flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  {categorias.find(c => c.id === produto.categoria_id)?.nome || 'Sem categoria'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {searchTerm ? (
                    <Search className="h-10 w-10 text-gray-400" />
                  ) : (
                    <Package className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? `Não encontramos produtos com "${searchTerm}". Tente uma busca diferente.`
                    : 'Comece criando seu primeiro produto para construir o cardápio.'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl"
                    onClick={() => {
                      setEditingProduto(null)
                      setIsDialogOpen(true)
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Criar Primeiro Produto
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

function ProdutoForm({
  produto,
  categorias,
  onSave,
  onCancel,
}: {
  produto: Produto | null
  categorias: Categoria[]
  onSave: (produto: Partial<Produto>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    nome: produto?.nome || "",
    descricao: produto?.descricao || "",
    categoria_id: produto?.categoria_id || "",
    tipo: produto?.tipo || "salgada",
    preco_tradicional: produto?.preco_tradicional || 0,
    preco_broto: produto?.preco_broto || 0,
    ativo: produto?.ativo ?? true,
    ordem: produto?.ordem || 0,
  })

  // Estados para os valores formatados dos preços
  const [precoTradicionalFormatado, setPrecoTradicionalFormatado] = useState(
    produto?.preco_tradicional ? formatCurrencyInput((produto.preco_tradicional * 100).toString()) : ""
  )
  const [precoBrotoFormatado, setPrecoBrotoFormatado] = useState(
    produto?.preco_broto ? formatCurrencyInput((produto.preco_broto * 100).toString()) : ""
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome" className="text-sm font-medium text-gray-700">Nome</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
            className="mt-1 rounded-lg border-gray-200 focus:border-blue-300 focus:ring-blue-200"
          />
        </div>
        <div>
          <Label htmlFor="categoria" className="text-sm font-medium text-gray-700">Categoria</Label>
          <Select
            value={formData.categoria_id}
            onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
          >
            <SelectTrigger className="mt-1 rounded-lg border-gray-200 focus:border-blue-300 focus:ring-blue-200">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="descricao" className="text-sm font-medium text-gray-700">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          className="mt-1 rounded-lg border-gray-200 focus:border-blue-300 focus:ring-blue-200"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="tipo" className="text-sm font-medium text-gray-700">Tipo</Label>
          <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
            <SelectTrigger className="mt-1 rounded-lg border-gray-200 focus:border-blue-300 focus:ring-blue-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="salgada">Salgada</SelectItem>
              <SelectItem value="doce">Doce</SelectItem>
              <SelectItem value="bebida">Bebida</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="preco_tradicional" className="text-sm font-medium text-gray-700">Preço Tradicional</Label>
          <Input
            id="preco_tradicional"
            type="text"
            value={precoTradicionalFormatado}
            onChange={(e) => {
              const valorFormatado = formatCurrencyInput(e.target.value)
              setPrecoTradicionalFormatado(valorFormatado)
              const valorNumerico = parseCurrencyInput(valorFormatado)
              setFormData({ ...formData, preco_tradicional: valorNumerico })
            }}
            placeholder="R$ 0,00"
            className="mt-1 rounded-lg border-gray-200 focus:border-blue-300 focus:ring-blue-200"
          />
        </div>
        <div>
          <Label htmlFor="preco_broto" className="text-sm font-medium text-gray-700">Preço Broto</Label>
          <Input
            id="preco_broto"
            type="text"
            value={precoBrotoFormatado}
            onChange={(e) => {
              const valorFormatado = formatCurrencyInput(e.target.value)
              setPrecoBrotoFormatado(valorFormatado)
              const valorNumerico = parseCurrencyInput(valorFormatado)
              setFormData({ ...formData, preco_broto: valorNumerico })
            }}
            placeholder="R$ 0,00"
            className="mt-1 rounded-lg border-gray-200 focus:border-blue-300 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={formData.ativo}
            onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Produto ativo</span>
        </label>
        <div className="flex items-center gap-2">
          <Label htmlFor="ordem" className="text-sm font-medium text-gray-700">Ordem</Label>
          <Input
            id="ordem"
            type="number"
            value={formData.ordem}
            onChange={(e) => setFormData({ ...formData, ordem: Number.parseInt(e.target.value) || 0 })}
            className="w-20 rounded-lg border-gray-200 focus:border-blue-300 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="px-6 py-2 rounded-lg border-gray-200 hover:bg-gray-50"
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Salvar
        </Button>
      </div>
    </form>
  )
}

function CategoriaForm({
  categoria,
  onSave,
  onCancel,
}: {
  categoria: Categoria | null
  onSave: (categoria: Partial<Categoria>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    nome: categoria?.nome || "",
    descricao: categoria?.descricao || "",
    ordem: categoria?.ordem || 0,
    ativo: categoria?.ativo ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome.trim()) {
      alert("Nome da categoria é obrigatório")
      return
    }
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="nome" className="text-sm font-medium text-gray-700">Nome da Categoria *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="Digite o nome da categoria"
          required
          className="mt-1 rounded-lg border-gray-200 focus:border-green-300 focus:ring-green-200"
        />
      </div>

      <div>
        <Label htmlFor="descricao" className="text-sm font-medium text-gray-700">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Digite uma descrição opcional"
          rows={3}
          className="mt-1 rounded-lg border-gray-200 focus:border-green-300 focus:ring-green-200"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ordem" className="text-sm font-medium text-gray-700">Ordem</Label>
          <Input
            id="ordem"
            type="number"
            value={formData.ordem}
            onChange={(e) => setFormData({ ...formData, ordem: Number.parseInt(e.target.value) || 0 })}
            placeholder="0"
            className="mt-1 rounded-lg border-gray-200 focus:border-green-300 focus:ring-green-200"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Categoria ativa</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="px-6 py-2 rounded-lg border-gray-200 hover:bg-gray-50"
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          {categoria ? "Atualizar" : "Criar"} Categoria
        </Button>
      </div>
    </form>
  )
}
