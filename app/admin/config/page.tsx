"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin-layout"
import { supabase } from "@/lib/supabase"
import { Save } from "lucide-react"

interface PizzariaConfig {
  id?: string
  nome: string
  foto_capa: string
  foto_perfil: string
  taxa_entrega: number
  tempo_entrega_min: number
  tempo_entrega_max: number
  valor_minimo: number
  aceita_dinheiro: boolean
  aceita_cartao: boolean
  endereco: string
  telefone: string
  whatsapp: string
}

export default function AdminConfigPage() {
  const [config, setConfig] = useState<PizzariaConfig>({
    nome: "",
    foto_capa: "",
    foto_perfil: "",
    taxa_entrega: 5.0,
    tempo_entrega_min: 60,
    tempo_entrega_max: 90,
    valor_minimo: 20.0,
    aceita_dinheiro: true,
    aceita_cartao: true,
    endereco: "",
    telefone: "",
    whatsapp: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase.from("pizzaria_config").select("*").single()

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar configurações:", error)
        return
      }

      if (data) {
        setConfig({
          ...data,
          nome: data.nome || "",
          foto_capa: data.foto_capa || "",
          foto_perfil: data.foto_perfil || "",
          endereco: data.endereco || "",
          telefone: data.telefone || "",
          whatsapp: data.whatsapp || "",
        })
      }
    } catch (error) {
      console.error("Erro ao conectar com Supabase:", error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage("")

    try {
      const { data, error } = await supabase.from("pizzaria_config").upsert(config).select().single()

      if (error) {
        console.error("Erro ao salvar:", error)
        setMessage("Erro ao salvar configurações")
      } else {
        setConfig(data)
        setMessage("Configurações salvas com sucesso!")
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      setMessage("Erro ao salvar configurações")
    }

    setLoading(false)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Configurações da Pizzaria</h1>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${message.includes("sucesso") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Pizzaria</Label>
                <Input
                  id="nome"
                  value={config.nome}
                  onChange={(e) => setConfig({ ...config, nome: e.target.value })}
                  placeholder="Nome da sua pizzaria"
                />
              </div>

              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={config.endereco}
                  onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
                  placeholder="Endereço completo da pizzaria"
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={config.telefone}
                  onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                  placeholder="(11) 3333-4444"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={config.whatsapp}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  placeholder="5511999887766"
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Entrega */}
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="taxa_entrega">Taxa de Entrega (R$)</Label>
                <Input
                  id="taxa_entrega"
                  type="number"
                  step="0.01"
                  value={config.taxa_entrega}
                  onChange={(e) => setConfig({ ...config, taxa_entrega: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="valor_minimo">Valor Mínimo (R$)</Label>
                <Input
                  id="valor_minimo"
                  type="number"
                  step="0.01"
                  value={config.valor_minimo}
                  onChange={(e) => setConfig({ ...config, valor_minimo: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tempo_min">Tempo Mín. (min)</Label>
                  <Input
                    id="tempo_min"
                    type="number"
                    value={config.tempo_entrega_min}
                    onChange={(e) => setConfig({ ...config, tempo_entrega_min: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="tempo_max">Tempo Máx. (min)</Label>
                  <Input
                    id="tempo_max"
                    type="number"
                    value={config.tempo_entrega_max}
                    onChange={(e) => setConfig({ ...config, tempo_entrega_max: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Formas de Pagamento</Label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.aceita_dinheiro}
                      onChange={(e) => setConfig({ ...config, aceita_dinheiro: e.target.checked })}
                    />
                    <span>Dinheiro</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.aceita_cartao}
                      onChange={(e) => setConfig({ ...config, aceita_cartao: e.target.checked })}
                    />
                    <span>Cartão</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imagens */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Imagens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="foto_capa">URL da Foto de Capa</Label>
                <Input
                  id="foto_capa"
                  value={config.foto_capa}
                  onChange={(e) => setConfig({ ...config, foto_capa: e.target.value })}
                  placeholder="https://exemplo.com/capa.jpg"
                />
              </div>

              <div>
                <Label htmlFor="foto_perfil">URL da Foto de Perfil</Label>
                <Input
                  id="foto_perfil"
                  value={config.foto_perfil}
                  onChange={(e) => setConfig({ ...config, foto_perfil: e.target.value })}
                  placeholder="https://exemplo.com/perfil.jpg"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
