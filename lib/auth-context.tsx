"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

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
  }, [])

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      // Buscar admin no banco de dados
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email)
        .eq("ativo", true)
        .single()

      if (error || !data) {
        // Fallback para credenciais padrão durante desenvolvimento
        if (email === "admin@pizzaria.com" && senha === "admin123") {
          const adminData = {
            id: "default-admin",
            email: "admin@pizzaria.com",
            nome: "Administrador",
          }
          setAdmin(adminData)
          localStorage.setItem("admin", JSON.stringify(adminData))
          return true
        }
        return false
      }

      // Por enquanto, vamos usar uma verificação simples até implementar bcrypt no frontend
      // Em produção, isso deveria ser feito no backend com hash seguro
      if (email === "admin@pizzaria.com" && senha === "admin123") {
        const adminData = {
          id: data.id,
          email: data.email,
          nome: data.nome,
        }
        setAdmin(adminData)
        localStorage.setItem("admin", JSON.stringify(adminData))
        return true
      }

      return false
    } catch (error) {
      console.error("Erro no login:", error)
      return false
    }
  }

  const updateCredentials = async (novoEmail: string, novaSenha: string): Promise<boolean> => {
    try {
      if (!admin) {
        return false
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
  }

  return <AuthContext.Provider value={{ admin, login, logout, updateCredentials, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
