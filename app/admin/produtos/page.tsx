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
import { AdminLayout } from "@/components/admin-layout"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from "@/lib/currency-utils"
import { Plus, Edit, Trash2 } from "lucide-react"

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gerenciar Produtos</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingProduto(null)
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProduto ? "Editar Produto" : "Novo Produto"}</DialogTitle>
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

        {/* Gerenciar Categorias */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Gerenciar Categorias</CardTitle>
              <Dialog open={isCategoriaDialogOpen} onOpenChange={setIsCategoriaDialogOpen}>
                <DialogTrigger asChild>
                  <Button
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
                    <DialogTitle>{editingCategoria ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
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
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Gerencie as categorias dos produtos. Categorias ajudam a organizar o cardápio.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorias.map((categoria) => (
                  <div key={categoria.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-lg">{categoria.nome}</h3>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCategoria(categoria)
                            setIsCategoriaDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteCategoria(categoria.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {categoria.descricao && (
                      <p className="text-sm text-gray-600 mb-3">{categoria.descricao}</p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ordem:</span>
                        <span className="font-medium">{categoria.ordem || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={(categoria.ativo ?? true) ? "text-green-600" : "text-red-600"}>
                          {(categoria.ativo ?? true) ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Produtos:</span>
                        <span className="font-medium">
                          {produtos.filter(p => p.categoria_id === categoria.id).length}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {categorias.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma categoria cadastrada.</p>
                  <p className="text-sm">Clique em "Nova Categoria" para começar.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controle de Opcoes de Sabores */}
        <Card>
          <CardHeader>
            <CardTitle>Configuracoes de Sabores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Configure quais opcoes de sabores estao disponiveis para os clientes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {opcoesSabores.map((opcao) => (
                  <div key={opcao.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium">{opcao.nome}</div>
                      {opcao.maximo_sabores === 1 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Obrigatorio
                        </span>
                      )}
                    </div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={opcao.ativo}
                        disabled={opcao.maximo_sabores === 1} // 1 sabor sempre habilitado
                        onChange={(e) => handleToggleOpcaoSabor(opcao.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-600">
                        {opcao.ativo ? "Habilitado" : "Desabilitado"}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtos.map((produto) => (
            <Card key={produto.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{produto.nome}</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProduto(produto)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(produto.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{produto.descricao}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Tradicional:</span>
                    <span className="font-medium">{formatCurrency(produto.preco_tradicional)}</span>
                  </div>
                  {produto.preco_broto && (
                    <div className="flex justify-between">
                      <span>Broto:</span>
                      <span className="font-medium">{formatCurrency(produto.preco_broto)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tipo:</span>
                    <span className="capitalize">{produto.tipo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={produto.ativo ? "text-green-600" : "text-red-600"}>
                      {produto.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="categoria">Categoria</Label>
          <Select
            value={formData.categoria_id}
            onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
          >
            <SelectTrigger>
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
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="tipo">Tipo</Label>
          <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
            <SelectTrigger>
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
          <Label htmlFor="preco_tradicional">Preço Tradicional</Label>
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
          />
        </div>
        <div>
          <Label htmlFor="preco_broto">Preço Broto</Label>
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
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.ativo}
            onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
          />
          <span>Produto ativo</span>
        </label>
        <div>
          <Label htmlFor="ordem">Ordem</Label>
          <Input
            id="ordem"
            type="number"
            value={formData.ordem}
            onChange={(e) => setFormData({ ...formData, ordem: Number.parseInt(e.target.value) || 0 })}
            className="w-20"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome da Categoria *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="Digite o nome da categoria"
          required
        />
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          placeholder="Digite uma descrição opcional"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ordem">Ordem</Label>
          <Input
            id="ordem"
            type="number"
            value={formData.ordem}
            onChange={(e) => setFormData({ ...formData, ordem: Number.parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.ativo}
              onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
            />
            <span className="text-sm">Categoria ativa</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {categoria ? "Atualizar" : "Criar"} Categoria
        </Button>
      </div>
    </form>
  )
}
