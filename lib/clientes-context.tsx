"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { searchCep, type AddressData } from "@/lib/cep-service"

export interface Cliente {
  id: string
  nome_completo: string
  telefone: string
  cep: string
  endereco_completo: string
  numero: string
  complemento?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface ClienteFormData {
  nome_completo: string
  telefone: string
  cep: string
  endereco_completo: string
  numero: string
  complemento?: string
}

export interface ClientesContextType {
  clientes: Cliente[]
  loading: boolean
  error: string | null
  
  // CRUD operations
  fetchClientes: () => Promise<void>
  createCliente: (clienteData: ClienteFormData) => Promise<Cliente | null>
  updateCliente: (id: string, clienteData: Partial<ClienteFormData>) => Promise<Cliente | null>
  deleteCliente: (id: string) => Promise<boolean>
  getClienteById: (id: string) => Cliente | null
  
  // CEP operations
  searchCepData: (cep: string) => Promise<AddressData | null>
  
  // Filters and search
  searchClientes: (query: string) => Cliente[]
  getClientesByStatus: (ativo: boolean) => Cliente[]
  
  // Utils
  clearError: () => void
  refreshClientes: () => Promise<void>
}

const ClientesContext = createContext<ClientesContextType | null>(null)

export function ClientesProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all clientes
  const fetchClientes = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: supabaseError } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (supabaseError) {
        throw new Error(supabaseError.message)
      }
      
      setClientes(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar clientes'
      setError(errorMessage)
      console.error('Erro ao buscar clientes:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create new cliente
  const createCliente = async (clienteData: ClienteFormData): Promise<Cliente | null> => {
    setLoading(true)
    setError(null)
    
    try {
      // Validate data before sending
      if (!clienteData.nome_completo?.trim()) {
        throw new Error('Nome completo é obrigatório')
      }
      if (!clienteData.telefone?.trim()) {
        throw new Error('Telefone é obrigatório')
      }
      
      const { data, error: supabaseError } = await supabase
        .from('clientes')
        .insert({
          ...clienteData,
          ativo: true
        })
        .select()
        .single()
      
      if (supabaseError) {
        if (supabaseError.code === '23505') {
          throw new Error('Já existe um cliente com este telefone')
        }
        throw new Error(supabaseError.message)
      }
      
      if (data) {
        setClientes(prev => [data, ...prev])
        return data
      }
      
      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar cliente'
      setError(errorMessage)
      console.error('Erro ao criar cliente:', err)
      throw err // Re-throw to allow component to handle
    } finally {
      setLoading(false)
    }
  }

  // Update cliente
  const updateCliente = async (id: string, clienteData: Partial<ClienteFormData>): Promise<Cliente | null> => {
    setLoading(true)
    setError(null)
    
    try {
      // Validate data before sending
      if (!id?.trim()) {
        throw new Error('ID do cliente é obrigatório')
      }
      if (clienteData.nome_completo !== undefined && !clienteData.nome_completo?.trim()) {
        throw new Error('Nome completo é obrigatório')
      }
      if (clienteData.telefone !== undefined && !clienteData.telefone?.trim()) {
        throw new Error('Telefone é obrigatório')
      }
      
      const { data, error: supabaseError } = await supabase
        .from('clientes')
        .update({
          ...clienteData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (supabaseError) {
        if (supabaseError.code === '23505') {
          throw new Error('Já existe um cliente com este telefone')
        }
        if (supabaseError.code === 'PGRST116') {
          throw new Error('Cliente não encontrado')
        }
        throw new Error(supabaseError.message)
      }
      
      if (!data) {
        throw new Error('Nenhum dado retornado após atualização')
      }
      
      const clienteAtualizado = data as Cliente
      setClientes(prev => prev.map(cliente => 
        cliente.id === id ? clienteAtualizado : cliente
      ))
      return clienteAtualizado
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao atualizar cliente'
      setError(errorMessage)
      console.error('Erro ao atualizar cliente:', err)
      throw err // Re-throw to allow component to handle
    } finally {
      setLoading(false)
    }
  }

  // Delete cliente (soft delete)
  const deleteCliente = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      // Validate ID
      if (!id?.trim()) {
        throw new Error('ID do cliente é obrigatório')
      }
      
      const { error: supabaseError } = await supabase
        .from('clientes')
        .update({ ativo: false })
        .eq('id', id)
      
      if (supabaseError) {
        if (supabaseError.code === 'PGRST116') {
          throw new Error('Cliente não encontrado')
        }
        if (supabaseError.code === '23503') {
          throw new Error('Não é possível excluir cliente com pedidos associados')
        }
        throw new Error(supabaseError.message)
      }
      
      setClientes(prev => prev.map(cliente => 
        cliente.id === id ? { ...cliente, ativo: false } : cliente
      ))
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao excluir cliente'
      setError(errorMessage)
      console.error('Erro ao excluir cliente:', err)
      throw err // Re-throw to allow component to handle
    } finally {
      setLoading(false)
    }
  }

  // Get cliente by ID
  const getClienteById = (id: string): Cliente | null => {
    return clientes.find(cliente => cliente.id === id) || null
  }

  // Search CEP data
  const searchCepData = async (cep: string): Promise<AddressData | null> => {
    try {
      // Validate CEP format
      if (!cep?.trim()) {
        throw new Error('CEP é obrigatório')
      }
      
      const cleanCep = cep.replace(/\D/g, '')
      
      if (cleanCep.length !== 8) {
        throw new Error('CEP deve ter exatamente 8 dígitos')
      }
      
      // Check if CEP starts with valid digits (basic validation)
      if (!/^[0-9]{8}$/.test(cleanCep)) {
        throw new Error('CEP deve conter apenas números')
      }
      
      const result = await searchCep(cep)
      if (result.success && result.data) {
        return result.data
      }
      
      const errorMessage = result.error || 'Erro ao buscar CEP'
      setError(errorMessage)
      throw new Error(errorMessage)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar CEP'
      setError(errorMessage)
      console.error('Erro ao buscar CEP:', err)
      throw err // Re-throw to allow component to handle
    }
  }

  // Search clientes by query
  const searchClientes = (query: string): Cliente[] => {
    if (!query.trim()) return clientes
    
    const searchTerm = query.toLowerCase().trim()
    return clientes.filter(cliente => 
      cliente.nome_completo.toLowerCase().includes(searchTerm) ||
      cliente.telefone.includes(searchTerm) ||
      cliente.cep.includes(searchTerm) ||
      cliente.endereco_completo.toLowerCase().includes(searchTerm)
    )
  }

  // Get clientes by status
  const getClientesByStatus = (ativo: boolean): Cliente[] => {
    return clientes.filter(cliente => cliente.ativo === ativo)
  }

  // Clear error
  const clearError = () => {
    setError(null)
  }

  // Refresh clientes
  const refreshClientes = async () => {
    await fetchClientes()
  }

  // Load clientes on mount
  useEffect(() => {
    fetchClientes()
  }, [])

  const value: ClientesContextType = {
    clientes,
    loading,
    error,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteById,
    searchCepData,
    searchClientes,
    getClientesByStatus,
    clearError,
    refreshClientes
  }

  return (
    <ClientesContext.Provider value={value}>
      {children}
    </ClientesContext.Provider>
  )
}

export function useClientes() {
  const context = useContext(ClientesContext)
  if (!context) {
    throw new Error('useClientes deve ser usado dentro de um ClientesProvider')
  }
  return context
}

export default ClientesContext