"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase, testSupabaseConnection, getSupabaseDebugInfo } from "@/lib/supabase"

interface Admin {
  id: string
  email: string
  nome: string
}

interface AuthContextType {
  admin: Admin | null
  login: (email: string, senha: string) => Promise<boolean>
  logout: () => void
  updateCredentials: (novoEmail: string, novaSenha: string) => Promise<boolean>
  loading: boolean
  connectionTest: () => Promise<any>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há admin logado no localStorage
    const savedAdmin = localStorage.getItem("admin")
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin))
    }
    setLoading(false)

    // Debug info on load
    getSupabaseDebugInfo()
  }, [])

  const connectionTest = async () => {
    console.log("🔧 Testando conexão com Supabase...")
    const result = await testSupabaseConnection()
    console.log("📊 Resultado do teste:", result)
    return result
  }

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      console.log("🔐 Iniciando processo de login...")
      
      // Test connection first
      const connectionResult = await testSupabaseConnection()
      if (!connectionResult.success) {
        console.error("❌ Falha na conexão:", connectionResult.error)
        console.error("📋 Detalhes:", connectionResult.details)
        throw new Error(`Erro de conexão: ${connectionResult.error}`)
      }

      console.log("✅ Conexão com Supabase verificada")

      // Buscar admin no banco de dados
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email)
        .eq("ativo", true)
        .single()

      if (error) {
        console.error("❌ Erro na consulta de admin:", error)
        if (error.code === 'PGRST116') {
          console.error("📋 Nenhum admin encontrado com este email")
        } else {
          console.error("📋 Erro técnico:", error.message)
        }
        return false
      }

      if (!data) {
        console.error("❌ Erro: Credenciais inválidas ou usuário não encontrado")
        return false
      }

      // IMPORTANTE: Em produção, implementar verificação de hash de senha segura
      // Por enquanto, verificação simplificada - DEVE SER ALTERADO PARA PRODUÇÃO
      console.warn("⚠️ ATENÇÃO: Sistema de autenticação simplificado - implementar hash de senha para produção")
      
      // Verificar senha (substituir por verificação de hash em produção)
      if (data.senha !== senha) {
        console.error("❌ Erro: Senha incorreta")
        return false
      }

      const adminData = {
        id: data.id,
        email: data.email,
        nome: data.nome,
      }
      
      setAdmin(adminData)
      localStorage.setItem("admin", JSON.stringify(adminData))
      console.log("✅ Login realizado com sucesso")
      return true
    } catch (error) {
      console.error("❌ Erro no sistema de login:", error)
      return false
    }
  }

  const updateCredentials = async (novoEmail: string, novaSenha: string): Promise<boolean> => {
    try {
      if (!admin) {
        return false
      }

      // Test connection first
      const connectionResult = await testSupabaseConnection()
      if (!connectionResult.success) {
        console.error("❌ Falha na conexão para atualizar credenciais:", connectionResult.error)
        throw new Error(`Erro de conexão: ${connectionResult.error}`)
      }

      // Por enquanto, vamos simular a atualização para desenvolvimento
      // Em produção, isso deveria ser feito com hash seguro no backend
      console.log("Simulando atualização de credenciais:", { novoEmail, novaSenha })
      
      // Atualizar dados locais
      const updatedAdmin = { ...admin, email: novoEmail }
      setAdmin(updatedAdmin)
      localStorage.setItem("admin", JSON.stringify(updatedAdmin))

      // Simular sucesso
      return true
    } catch (error) {
      console.error("Erro ao atualizar credenciais:", error)
      return false
    }
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem("admin")
    console.log("🚪 Logout realizado")
  }

  return <AuthContext.Provider value={{ admin, login, logout, updateCredentials, loading, connectionTest }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
