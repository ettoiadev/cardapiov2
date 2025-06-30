"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/admin-layout"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatCurrencyInput, parseCurrencyInput } from "@/lib/currency-utils"
import { 
  Save, 
  Settings, 
  Store, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Truck, 
  DollarSign, 
  Clock, 
  CreditCard, 
  Image,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileImage,
  Loader2,
  Trash2
} from "lucide-react"

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
  aceita_pix: boolean
  aceita_ticket_alimentacao: boolean
  endereco: string
  telefone: string
  whatsapp: string
  horario_funcionamento: any
}

export default function AdminConfigPage() {
  const daysOrder = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]
  
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
    aceita_pix: true,
    aceita_ticket_alimentacao: false,
    endereco: "",
    telefone: "",
    whatsapp: "",
    horario_funcionamento: {
      segunda: "18:00-23:00",
      terca: "18:00-23:00",
      quarta: "18:00-23:00",
      quinta: "18:00-23:00",
      sexta: "18:00-00:00",
      sabado: "18:00-00:00",
      domingo: "18:00-23:00",
    },
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [uploadingCapa, setUploadingCapa] = useState(false)
  const [uploadingPerfil, setUploadingPerfil] = useState(false)

  // Estados para valores formatados
  const [taxaEntregaFormatada, setTaxaEntregaFormatada] = useState("")
  const [valorMinimoFormatado, setValorMinimoFormatado] = useState("")

  // Refs para inputs de arquivo
  const capaInputRef = useRef<HTMLInputElement>(null)
  const perfilInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadConfig()
  }, [])

  // Função para redimensionar imagem
  const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new window.Image()

      if (!ctx) {
        reject(new Error('Não foi possível obter contexto do canvas'))
        return
      }

      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Erro ao processar imagem'))
          }
        }, 'image/jpeg', 0.9)
      }

      img.onerror = () => reject(new Error('Erro ao carregar imagem'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Função para fazer upload da imagem
  const uploadImage = async (file: File | Blob, folder: string, originalFileName?: string): Promise<string> => {
    try {
      // Verificar se temos um nome de arquivo válido
      let baseName = 'image'
      if (file instanceof File && file.name) {
        baseName = file.name.replace(/[^a-zA-Z0-9.-]/g, '')
      } else if (originalFileName) {
        baseName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '')
      }
      
      // Garantir que temos uma extensão
      if (!baseName.includes('.')) {
        baseName += '.jpg'
      }
      
      const fileName = `${folder}/${Date.now()}-${baseName}`
      
      let uploadResult = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadResult.error) {
        // Se o bucket não existir, tentar criar
        if (uploadResult.error.message.includes('Bucket not found')) {
          await supabase.storage.createBucket('images', {
            public: true,
            allowedMimeTypes: ['image/*'],
            fileSizeLimit: 5242880 // 5MB
          })
          
          // Tentar upload novamente
          uploadResult = await supabase.storage
            .from('images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            })
          
          if (uploadResult.error) throw uploadResult.error
        } else {
          throw uploadResult.error
        }
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)

      return urlData.publicUrl
    } catch (error) {
      console.error('Erro no upload:', error)
      if (error instanceof Error) {
        throw new Error(`Falha no upload: ${error.message}`)
      }
      throw new Error('Falha ao carregar imagem. Verifique o formato e tente novamente.')
    }
  }

  // Função para processar upload da foto de capa
  const handleCapaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar arquivo
    if (!file.name) {
      setMessage("Falha ao carregar imagem. Arquivo inválido.")
      return
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setMessage("Falha ao carregar imagem. Verifique o formato e tente novamente.")
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5242880) {
      setMessage("Falha ao carregar imagem. Arquivo muito grande (máximo 5MB).")
      return
    }

    setUploadingCapa(true)
    try {
      // Redimensionar para 1200x675px (16:9)
      const resizedFile = await resizeImage(file, 1200, 675)
      const url = await uploadImage(resizedFile, 'capas', file.name)
      
      setConfig({ ...config, foto_capa: url })
      setMessage("Foto de capa carregada com sucesso!")
    } catch (error) {
      console.error('Erro ao processar capa:', error)
      setMessage("Falha ao carregar imagem. Verifique o formato e tente novamente.")
    } finally {
      setUploadingCapa(false)
      if (capaInputRef.current) {
        capaInputRef.current.value = ''
      }
    }
  }

  // Função para processar upload da foto de perfil
  const handlePerfilUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar arquivo
    if (!file.name) {
      setMessage("Falha ao carregar imagem. Arquivo inválido.")
      return
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setMessage("Falha ao carregar imagem. Verifique o formato e tente novamente.")
      return
    }

    // Validar tamanho (5MB)
    if (file.size > 5242880) {
      setMessage("Falha ao carregar imagem. Arquivo muito grande (máximo 5MB).")
      return
    }

    setUploadingPerfil(true)
    try {
      // Redimensionar para 300x300px (1:1)
      const resizedFile = await resizeImage(file, 300, 300)
      const url = await uploadImage(resizedFile, 'perfis', file.name)
      
      setConfig({ ...config, foto_perfil: url })
      setMessage("Foto de perfil carregada com sucesso!")
    } catch (error) {
      console.error('Erro ao processar perfil:', error)
      setMessage("Falha ao carregar imagem. Verifique o formato e tente novamente.")
    } finally {
      setUploadingPerfil(false)
      if (perfilInputRef.current) {
        perfilInputRef.current.value = ''
      }
    }
  }

  // Função para extrair o nome do arquivo da URL do Supabase
  const extractFilePathFromUrl = (url: string): string | null => {
    try {
      // URL padrão do Supabase: https://projeto.supabase.co/storage/v1/object/public/bucket/path/file.jpg
      const urlParts = url.split('/storage/v1/object/public/images/')
      if (urlParts.length > 1) {
        return urlParts[1]
      }
      return null
    } catch (error) {
      console.error('Erro ao extrair caminho do arquivo:', error)
      return null
    }
  }

  // Função para excluir foto de capa
  const handleDeleteCapa = async () => {
    if (!config.foto_capa) return

    const confirmDelete = confirm("Tem certeza que deseja excluir a foto de capa?")
    if (!confirmDelete) return

    try {
      // Extrair caminho do arquivo da URL
      const filePath = extractFilePathFromUrl(config.foto_capa)
      
      if (filePath) {
        // Tentar remover do Supabase Storage
        const { error: storageError } = await supabase.storage
          .from('images')
          .remove([filePath])
        
        if (storageError) {
          console.warn('Aviso: Não foi possível remover arquivo do storage:', storageError.message)
        }
      }

      // Atualizar estado local
      setConfig({ ...config, foto_capa: "" })
      
      // Atualizar banco de dados
      const { error: dbError } = await supabase
        .from('pizzaria_config')
        .update({ foto_capa: null })
        .eq('id', config.id)

      if (dbError) {
        console.error('Erro ao atualizar banco:', dbError)
        setMessage("Erro ao excluir imagem. Tente novamente.")
      } else {
        setMessage("Imagem excluída com sucesso.")
      }
    } catch (error) {
      console.error('Erro ao excluir capa:', error)
      setMessage("Erro ao excluir imagem. Tente novamente.")
    }
  }

  // Função para excluir foto de perfil
  const handleDeletePerfil = async () => {
    if (!config.foto_perfil) return

    const confirmDelete = confirm("Tem certeza que deseja excluir a foto de perfil?")
    if (!confirmDelete) return

    try {
      // Extrair caminho do arquivo da URL
      const filePath = extractFilePathFromUrl(config.foto_perfil)
      
      if (filePath) {
        // Tentar remover do Supabase Storage
        const { error: storageError } = await supabase.storage
          .from('images')
          .remove([filePath])
        
        if (storageError) {
          console.warn('Aviso: Não foi possível remover arquivo do storage:', storageError.message)
        }
      }

      // Atualizar estado local
      setConfig({ ...config, foto_perfil: "" })
      
      // Atualizar banco de dados
      const { error: dbError } = await supabase
        .from('pizzaria_config')
        .update({ foto_perfil: null })
        .eq('id', config.id)

      if (dbError) {
        console.error('Erro ao atualizar banco:', dbError)
        setMessage("Erro ao excluir imagem. Tente novamente.")
      } else {
        setMessage("Imagem excluída com sucesso.")
      }
    } catch (error) {
      console.error('Erro ao excluir perfil:', error)
      setMessage("Erro ao excluir imagem. Tente novamente.")
    }
  }

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase.from("pizzaria_config").select("*").single()

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar configurações:", error)
        return
      }

      if (data) {
        const configData = {
          ...data,
          nome: data.nome || "",
          foto_capa: data.foto_capa || "",
          foto_perfil: data.foto_perfil || "",
          endereco: data.endereco || "",
          telefone: data.telefone || "",
          whatsapp: data.whatsapp || "",
          aceita_pix: data.aceita_pix !== undefined ? data.aceita_pix : true,
          aceita_ticket_alimentacao: data.aceita_ticket_alimentacao !== undefined ? data.aceita_ticket_alimentacao : false,
          horario_funcionamento: data.horario_funcionamento || {
            segunda: "18:00-23:00",
            terca: "18:00-23:00",
            quarta: "18:00-23:00",
            quinta: "18:00-23:00",
            sexta: "18:00-00:00",
            sabado: "18:00-00:00",
            domingo: "18:00-23:00",
          },
        }
        setConfig(configData)
        
        // Formatar valores monetários
        setTaxaEntregaFormatada(formatCurrencyInput((configData.taxa_entrega * 100).toString()))
        setValorMinimoFormatado(formatCurrencyInput((configData.valor_minimo * 100).toString()))
      } else {
        // Valores padrão formatados
        setTaxaEntregaFormatada(formatCurrencyInput("500")) // R$ 5,00
        setValorMinimoFormatado(formatCurrencyInput("2000")) // R$ 20,00
      }
    } catch (error) {
      console.error("Erro ao conectar com Supabase:", error)
    }
  }

  const updateHorario = (dia: string, horario: string) => {
    setConfig({
      ...config,
      horario_funcionamento: {
        ...config.horario_funcionamento,
        [dia]: horario,
      },
    })
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="h-8 w-8 text-gray-600" />
                Configurações da Pizzaria
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Configure todas as informações da sua pizzaria, horários de funcionamento, entrega e formas de pagamento.
              </p>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <Card className={`shadow-lg border-0 rounded-2xl overflow-hidden ${message.includes("sucesso") ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"}`}>
            <CardContent className="p-6">
              <div className={`flex items-center gap-3 ${message.includes("sucesso") ? "text-green-700" : "text-red-700"}`}>
                {message.includes("sucesso") ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <AlertCircle className="h-6 w-6" />
                )}
                <span className="font-medium">{message}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Cards Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Basic Information */}
          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Store className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Informações Básicas
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Nome, endereço e contatos da pizzaria
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="nome" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Nome da Pizzaria
                </Label>
                <Input
                  id="nome"
                  value={config.nome}
                  onChange={(e) => setConfig({ ...config, nome: e.target.value })}
                  placeholder="Digite o nome da sua pizzaria"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="endereco" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Endereço Completo
                </Label>
                <Textarea
                  id="endereco"
                  value={config.endereco}
                  onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
                  placeholder="Rua, número, bairro, cidade, CEP"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    value={config.telefone}
                    onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                    placeholder="(11) 3333-4444"
                    className="mt-1 rounded-lg border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    value={config.whatsapp}
                    onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                    placeholder="5511999887766"
                    className="mt-1 rounded-lg border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Settings */}
          <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    Configurações de Entrega
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Taxas, tempos e formas de pagamento
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxa_entrega" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Taxa de Entrega
                  </Label>
                  <Input
                    id="taxa_entrega"
                    type="text"
                    value={taxaEntregaFormatada}
                    onChange={(e) => {
                      const valorFormatado = formatCurrencyInput(e.target.value)
                      setTaxaEntregaFormatada(valorFormatado)
                      const valorNumerico = parseCurrencyInput(valorFormatado)
                      setConfig({ ...config, taxa_entrega: valorNumerico })
                    }}
                    placeholder="R$ 0,00"
                    className="mt-1 rounded-lg border-gray-200 focus:border-green-300 focus:ring-green-200"
                  />
                </div>

                <div>
                  <Label htmlFor="valor_minimo" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor Mínimo
                  </Label>
                  <Input
                    id="valor_minimo"
                    type="text"
                    value={valorMinimoFormatado}
                    onChange={(e) => {
                      const valorFormatado = formatCurrencyInput(e.target.value)
                      setValorMinimoFormatado(valorFormatado)
                      const valorNumerico = parseCurrencyInput(valorFormatado)
                      setConfig({ ...config, valor_minimo: valorNumerico })
                    }}
                    placeholder="R$ 0,00"
                    className="mt-1 rounded-lg border-gray-200 focus:border-green-300 focus:ring-green-200"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4" />
                  Tempo de Entrega
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tempo_min" className="text-xs text-gray-500">Mínimo (min)</Label>
                    <Input
                      id="tempo_min"
                      type="number"
                      value={config.tempo_entrega_min}
                      onChange={(e) => setConfig({ ...config, tempo_entrega_min: Number.parseInt(e.target.value) || 0 })}
                      className="mt-1 rounded-lg border-gray-200 focus:border-green-300 focus:ring-green-200"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tempo_max" className="text-xs text-gray-500">Máximo (min)</Label>
                    <Input
                      id="tempo_max"
                      type="number"
                      value={config.tempo_entrega_max}
                      onChange={(e) => setConfig({ ...config, tempo_entrega_max: Number.parseInt(e.target.value) || 0 })}
                      className="mt-1 rounded-lg border-gray-200 focus:border-green-300 focus:ring-green-200"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4" />
                  Formas de Pagamento
                </Label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 transition-colors hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={config.aceita_dinheiro}
                      onChange={(e) => setConfig({ ...config, aceita_dinheiro: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-900">💵 Dinheiro</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 transition-colors hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={config.aceita_cartao}
                      onChange={(e) => setConfig({ ...config, aceita_cartao: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-900">💳 Cartão</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 transition-colors hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={config.aceita_pix}
                      onChange={(e) => setConfig({ ...config, aceita_pix: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-900">🏦 Pix</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 transition-colors hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={config.aceita_ticket_alimentacao}
                      onChange={(e) => setConfig({ ...config, aceita_ticket_alimentacao: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-900">🍽️ Ticket Alimentação</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Operating Hours */}
        <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Horários de Funcionamento
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Configure os horários de abertura e fechamento para cada dia da semana
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {daysOrder.map((dia) => {
                const horario = config.horario_funcionamento?.[dia] || ""
                const dayNames = {
                  segunda: 'Segunda-feira',
                  terca: 'Terça-feira',
                  quarta: 'Quarta-feira',
                  quinta: 'Quinta-feira',
                  sexta: 'Sexta-feira',
                  sabado: 'Sábado',
                  domingo: 'Domingo'
                }
                return (
                  <div key={dia} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Label htmlFor={dia} className="text-sm font-medium text-gray-700 block mb-2">
                      {dayNames[dia as keyof typeof dayNames]}
                    </Label>
                    <Input
                      id={dia}
                      value={horario}
                      onChange={(e) => updateHorario(dia, e.target.value)}
                      placeholder="18:00-23:00"
                      className="rounded-lg border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                    />
                  </div>
                )
              })}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                💡 <strong>Dica:</strong> Use o formato "HH:MM-HH:MM" (ex: 18:00-23:00) ou digite "Fechado" para dias sem funcionamento.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="shadow-lg border-0 bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Image className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Imagens da Pizzaria
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Faça upload das imagens que aparecerão no cardápio
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Upload Foto de Capa */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                <FileImage className="h-4 w-4" />
                Foto de Capa
              </Label>
              
              <div className="space-y-3">
                {/* Preview da imagem atual */}
                {config.foto_capa && (
                  <div className="relative">
                    <img
                      src={config.foto_capa}
                      alt="Preview da capa"
                      className="w-full h-40 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteCapa}
                        className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white shadow-lg"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Área de upload */}
                <div 
                  className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer"
                  onClick={() => capaInputRef.current?.click()}
                >
                  {uploadingCapa ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
                      <p className="text-sm text-gray-600">Processando imagem...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-orange-600" />
                      <p className="text-sm font-medium text-gray-700">Clique para selecionar imagem</p>
                      <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                    </div>
                  )}
                </div>
                
                <input
                  ref={capaInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCapaUpload}
                  className="hidden"
                />
                
                <p className="text-xs text-gray-500">
                  Imagem principal exibida no topo do cardápio. Tamanho ideal: 1200x675px.
                </p>
              </div>
            </div>

            {/* Upload Foto de Perfil */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                <FileImage className="h-4 w-4" />
                Foto de Perfil
              </Label>
              
              <div className="space-y-3">
                {/* Preview da imagem atual */}
                {config.foto_perfil && (
                  <div className="relative inline-block">
                    <img
                      src={config.foto_perfil}
                      alt="Preview do perfil"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute -top-2 -right-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeletePerfil}
                        className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white shadow-lg"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Área de upload */}
                <div 
                  className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer"
                  onClick={() => perfilInputRef.current?.click()}
                >
                  {uploadingPerfil ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
                      <p className="text-sm text-gray-600">Processando imagem...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-orange-600" />
                      <p className="text-sm font-medium text-gray-700">Clique para selecionar imagem</p>
                      <p className="text-xs text-gray-500">PNG, JPG até 5MB</p>
                    </div>
                  )}
                </div>
                
                <input
                  ref={perfilInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePerfilUpload}
                  className="hidden"
                />
                
                <p className="text-xs text-gray-500">
                  Logo ou imagem de perfil da pizzaria. Tamanho ideal: 300x300px.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
