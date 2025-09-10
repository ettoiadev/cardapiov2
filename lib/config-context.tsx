"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { supabaseOperation, fallbackData } from "@/lib/error-handler"
import { log } from "@/lib/logger"

interface PizzariaConfig {
  habilitar_broto: boolean
  habilitar_bordas_recheadas: boolean
}

interface ConfigContextType {
  config: PizzariaConfig
  updateConfig: (newConfig: Partial<PizzariaConfig>) => Promise<void>
  loading: boolean
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PizzariaConfig>({
    habilitar_broto: true,
    habilitar_bordas_recheadas: true
  })
  const [configId, setConfigId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadConfig = async () => {
    const result = await supabaseOperation(
      () => supabase.from("pizzaria_config").select("id, habilitar_broto, habilitar_bordas_recheadas").maybeSingle(),
      fallbackData.pizzariaConfig
    )

    if (result.success && result.data) {
      setConfigId(result.data.id)
      setConfig({
        habilitar_broto: result.data.habilitar_broto ?? true,
        habilitar_bordas_recheadas: result.data.habilitar_bordas_recheadas ?? true
      })
      log.info("Configuração carregada com sucesso", 'CONFIG', { configId: result.data.id })
    } else {
      log.warn("Erro ao carregar configuração - usando fallback", 'CONFIG')
      setConfig(fallbackData.pizzariaConfig)
    }
    
    setLoading(false)
  }

  const updateConfig = async (newConfig: Partial<PizzariaConfig>) => {
    try {
      if (!configId) {
        throw new Error("ID da configuração não encontrado")
      }

      const { error } = await supabase
        .from("pizzaria_config")
        .update(newConfig)
        .eq("id", configId)

      if (error) throw error

      setConfig(prev => ({ ...prev, ...newConfig }))
    } catch (error) {
      log.error("Erro ao atualizar configurações", 'CONFIG', {}, error)
      throw error
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  return (
    <ConfigContext.Provider value={{ config, updateConfig, loading }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error("useConfig deve ser usado dentro de um ConfigProvider")
  }
  return context
}