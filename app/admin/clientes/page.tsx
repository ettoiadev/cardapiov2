"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AdminLayout } from "@/components/admin-layout"
import { supabase } from "@/lib/supabase"
import { Search, User } from "lucide-react"

interface Cliente {
  id: string
  nome: string
  email: string | null
  telefone: string | null
  endereco: string | null
  cep: string | null
  cidade: string | null
  estado: string | null
  created_at: string
}

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadClientes()
  }, [])

  useEffect(() => {
    const filtered = clientes.filter(
      (cliente) =>
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefone?.includes(searchTerm),
    )
    setFilteredClientes(filtered)
  }, [clientes, searchTerm])

  const loadClientes = async () => {
    try {
      const { data, error } = await supabase.from("clientes").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao carregar clientes:", error)
        return
      }

      if (data) {
        setClientes(data)
        setFilteredClientes(data)
      }
    } catch (error) {
      console.error("Erro ao conectar com Supabase:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Clientes Cadastrados</h1>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClientes.map((cliente) => (
            <Card key={cliente.id}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                    <p className="text-sm text-gray-500">Cadastrado em {formatDate(cliente.created_at)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {cliente.email && (
                  <div>
                    <span className="text-sm font-medium">Email:</span>
                    <p className="text-sm text-gray-600">{cliente.email}</p>
                  </div>
                )}
                {cliente.telefone && (
                  <div>
                    <span className="text-sm font-medium">Telefone:</span>
                    <p className="text-sm text-gray-600">{cliente.telefone}</p>
                  </div>
                )}
                {cliente.endereco && (
                  <div>
                    <span className="text-sm font-medium">Endereço:</span>
                    <p className="text-sm text-gray-600">{cliente.endereco}</p>
                    {cliente.cidade && cliente.estado && (
                      <p className="text-sm text-gray-600">
                        {cliente.cidade} - {cliente.estado}
                        {cliente.cep && ` • CEP: ${cliente.cep}`}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClientes.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? "Tente buscar com outros termos" : "Os clientes aparecerão aqui quando se cadastrarem"}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
