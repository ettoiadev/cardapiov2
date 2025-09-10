"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase, testSupabaseConnection, getSupabaseDebugInfo } from "@/lib/supabase"
import { supabaseOperation } from "@/lib/error-handler"
import { log } from "@/lib/logger"

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
      log.info("Tentando fazer login", 'AUTH', { email })
      
      // Test connection first
      log.info("Testando conexão com Supabase", 'AUTH')
      const connectionResult = await testSupabaseConnection()
      if (!connectionResult.success) {
        log.error("Erro de conexão com Supabase", 'AUTH', {}, connectionResult.error)
        throw new Error(`Erro de conexão: ${connectionResult.error}`)
      }

      log.info("Conexão com Supabase estabelecida", 'AUTH')

      // Primeiro, vamos verificar se existem admins na tabela
      console.log("🔍 Verificando todos os admins na tabela...")
      const { data: allAdmins, error: allAdminsError } = await supabase
        .from("admins")
        .select("*")

      if (allAdminsError) {
        console.error("❌ Erro ao consultar todos os admins:", allAdminsError)
      } else {
        console.log("📋 Todos os admins encontrados:", allAdmins)
        console.log("📊 Total de admins:", allAdmins?.length || 0)
      }

      // Agora vamos tentar a consulta específica com logs detalhados
      log.info("Buscando dados do admin", 'AUTH', { email })
      const result = await supabaseOperation(
        () => supabase
          .from("admins")
          .select("*")
          .eq("email", email)
          .eq("ativo", true)
          .maybeSingle()
      )

      log.info("Consulta de admin executada", 'AUTH', { hasData: !!result.data })

      if (!result.success) {
        log.error("Erro na consulta de admin", 'AUTH', {}, result.error)
        return false
      }

      if (!result.data) {
        log.warn("Nenhum admin encontrado com este email", 'AUTH', { email })
        return false
      }

      const adminData = result.data
      log.info("Admin encontrado", 'AUTH', { adminId: adminData.id, email: adminData.email })

      // IMPORTANTE: Em produção, implementar verificação de hash de senha segura
      // Por enquanto, verificação simplificada - DEVE SER ALTERADO PARA PRODUÇÃO
      // console.warn("⚠️ ATENÇÃO: Sistema de autenticação simplificado - implementar hash de senha para produção")
      
      // Verificar senha (substituir por verificação de hash em produção)
      if (adminData.senha !== senha) {
        log.warn("Senha incorreta", 'AUTH', { email })
        return false
      }

      const responseAdminData = {
        id: adminData.id,
        email: adminData.email,
        nome: adminData.nome,
      }
      
      setAdmin(responseAdminData)
      localStorage.setItem("admin", JSON.stringify(responseAdminData))
      log.info("Login realizado com sucesso", 'AUTH', { adminId: adminData.id })
      return true
    } catch (error) {
      log.error("Erro no sistema de login", 'AUTH', { email }, error instanceof Error ? error : new Error(String(error)))
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
        log.error("Falha na conexão para atualizar credenciais", 'AUTH', {}, connectionResult.error)
        throw new Error(`Erro de conexão: ${connectionResult.error}`)
      }

      // Por enquanto, vamos simular a atualização para desenvolvimento
      // Em produção, isso deveria ser feito com hash seguro no backend
      log.info("Simulando atualização de credenciais", 'AUTH', { novoEmail })
      
      // Atualizar dados locais
      const updatedAdmin = { ...admin, email: novoEmail }
      setAdmin(updatedAdmin)
      localStorage.setItem("admin", JSON.stringify(updatedAdmin))

      // Simular sucesso
      return true
    } catch (error) {
      log.error("Erro ao atualizar credenciais", 'AUTH', {}, error instanceof Error ? error : new Error(String(error)))
      return false
    }
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem("admin")
    log.info("Logout realizado", 'AUTH')
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
