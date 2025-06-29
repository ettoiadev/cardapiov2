"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import { supabase } from "@/lib/supabase"
import { 
  Search, 
  User, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  UserCheck,
  Building
} from "lucide-react"

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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                Clientes Cadastrados
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Visualize e gerencie todos os clientes cadastrados no sistema, acompanhe informações de contato e histórico.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-100 px-4 py-2 rounded-lg">
                <UserCheck className="h-4 w-4" />
                {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''} {searchTerm ? 'encontrado(s)' : 'total'}
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 rounded-lg">
                  <Search className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Buscar Clientes
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Encontre clientes por nome, email ou telefone
                  </p>
                </div>
              </div>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-80 rounded-lg border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Clients Grid */}
        {filteredClientes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClientes.map((cliente) => (
              <Card key={cliente.id} className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-100 p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-200 rounded-xl">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {cliente.nome}
                      </CardTitle>
                      <p className="text-sm text-blue-600 flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        Cadastrado em {formatDate(cliente.created_at)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                  {/* Contact Information */}
                  <div className="space-y-3">
                    {cliente.email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-gray-200 rounded-lg">
                          <Mail className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                          <p className="text-sm text-gray-900 font-medium">{cliente.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {cliente.telefone && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="p-2 bg-green-200 rounded-lg">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-green-600 uppercase">Telefone</p>
                          <p className="text-sm text-gray-900 font-medium">{cliente.telefone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address Information */}
                  {cliente.endereco && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-200 rounded-lg">
                          <MapPin className="h-4 w-4 text-orange-600" />
                        </div>
                        <h4 className="font-semibold text-gray-900">Endereço</h4>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700">{cliente.endereco}</p>
                        {cliente.cidade && cliente.estado && (
                          <div className="flex items-center gap-2">
                            <Building className="h-3 w-3 text-gray-500" />
                            <p className="text-sm text-gray-600">
                              {cliente.cidade} - {cliente.estado}
                            </p>
                          </div>
                        )}
                        {cliente.cep && (
                          <p className="text-sm text-gray-600">CEP: {cliente.cep}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex justify-end">
                    <Badge className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Cliente Ativo
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {searchTerm ? (
                    <Search className="h-10 w-10 text-gray-400" />
                  ) : (
                    <Users className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchTerm 
                    ? `Não encontramos clientes com "${searchTerm}". Tente buscar com outros termos.`
                    : "Os clientes aparecerão aqui quando se cadastrarem no sistema através do cardápio."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
