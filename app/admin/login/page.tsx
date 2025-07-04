"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isConfigured, setIsConfigured] = useState(true)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)
  const { login, connectionTest } = useAuth()
  const router = useRouter()

  // Verificar configuração do Supabase ao carregar a página
  React.useEffect(() => {
    const checkConfig = () => {
      const configured = isSupabaseConfigured()
      setIsConfigured(configured)
      if (!configured) {
        setError("Sistema não configurado. Entre em contato com o administrador técnico.")
      }
    }
    checkConfig()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Verificar se o Supabase está configurado
    if (!isSupabaseConfigured()) {
      setError("Sistema não configurado. Verifique as variáveis de ambiente do Supabase.")
      setLoading(false)
      return
    }

    try {
      const success = await login(email, senha)
      if (success) {
        router.push("/admin")
      } else {
        setError("Email ou senha incorretos")
      }
    } catch (error) {
      console.error("Erro durante login:", error)
      if (error instanceof Error) {
        if (error.message.includes("network") || error.message.includes("fetch")) {
          setError("Erro de conexão. Verifique sua internet e tente novamente.")
        } else if (error.message.includes("CORS") || error.message.includes("origin")) {
          setError("Erro de configuração do servidor. Entre em contato com o suporte.")
        } else {
          setError("Erro interno do sistema. Tente novamente.")
        }
      } else {
        setError("Erro inesperado. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setError("")
    setConnectionStatus(null)
    const configured = isSupabaseConfigured()
    setIsConfigured(configured)
    if (!configured) {
      setError("Sistema ainda não configurado. Entre em contato com o administrador técnico.")
    }
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setConnectionStatus(null)
    
    try {
      const result = await connectionTest()
      if (result.success) {
        setConnectionStatus(`✅ ${result.message}${result.hasData ? ' - Dados encontrados' : ' - Banco vazio'}`)
        setError("")
      } else {
        setConnectionStatus(`❌ ${result.error}: ${result.details}`)
        setError(result.error)
      }
    } catch (error) {
      setConnectionStatus("❌ Erro ao testar conexão")
      setError("Falha no teste de conectividade")
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Painel Administrativo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email do administrador"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
                required
                disabled={!isConfigured}
              />
            </div>
            <div>
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                disabled={!isConfigured}
              />
            </div>
            
            {/* Status da conexão */}
            {connectionStatus && (
              <div className={`p-3 rounded-lg text-sm ${
                connectionStatus.startsWith('✅') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {connectionStatus}
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{error}</span>
                {!isConfigured && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRetry}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !isConfigured}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>

              {/* Botão de teste de conectividade */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleTestConnection}
                disabled={testingConnection}
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  <>
                    {isConfigured ? (
                      <Wifi className="h-4 w-4 mr-2" />
                    ) : (
                      <WifiOff className="h-4 w-4 mr-2" />
                    )}
                    Testar Conexão
                  </>
                )}
              </Button>
            </div>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Acesse com suas credenciais de administrador
            </p>
            {!isConfigured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-yellow-800">
                  <strong>Para desenvolvedores:</strong> Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
