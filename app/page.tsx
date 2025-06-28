"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, CreditCard, Banknote } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { CartProvider } from "@/lib/cart-context"
import { PizzaSelectionModal } from "@/components/pizza-selection-modal"
import { StoreInfoModal } from "@/components/store-info-modal"
import { CartFooter } from "@/components/cart-footer"

interface PizzariaConfig {
  id: string
  nome: string
  foto_capa: string | null
  foto_perfil: string | null
  taxa_entrega: number
  tempo_entrega_min: number
  tempo_entrega_max: number
  valor_minimo: number
  aceita_dinheiro: boolean
  aceita_cartao: boolean
  endereco: string | null
  telefone: string | null
  whatsapp: string | null
  horario_funcionamento: any
}

interface Produto {
  id: string
  nome: string
  descricao: string | null
  preco_tradicional: number | null
  preco_broto: number | null
  tipo: string
  ativo: boolean
}

// Mock data for when Supabase is not configured
const mockConfig: PizzariaConfig = {
  id: "1",
  nome: "Pizzaria Bella Vista",
  foto_capa: "/placeholder.jpg",
  foto_perfil: "/placeholder-logo.png",
  taxa_entrega: 5.0,
  tempo_entrega_min: 60,
  tempo_entrega_max: 90,
  valor_minimo: 20.0,
  aceita_dinheiro: true,
  aceita_cartao: true,
  endereco: "Rua das Flores, 123 - Centro",
  telefone: "(11) 99999-9999",
  whatsapp: "5511999999999",
  horario_funcionamento: {
    segunda: "18:00-23:00",
    terca: "18:00-23:00",
    quarta: "18:00-23:00",
    quinta: "18:00-23:00",
    sexta: "18:00-00:00",
    sabado: "18:00-00:00",
    domingo: "18:00-23:00",
  },
}

const mockProdutos: Produto[] = [
  // Pizzas Salgadas
  {
    id: "1",
    nome: "Margherita",
    descricao: "Molho de tomate, mussarela, manjericão",
    preco_tradicional: 35.0,
    preco_broto: 25.0,
    tipo: "salgada",
    ativo: true,
  },
  {
    id: "2",
    nome: "Calabresa",
    descricao: "Molho de tomate, mussarela, calabresa, cebola",
    preco_tradicional: 38.0,
    preco_broto: 28.0,
    tipo: "salgada",
    ativo: true,
  },
  {
    id: "3",
    nome: "Portuguesa",
    descricao: "Molho de tomate, mussarela, presunto, ovos, cebola, azeitona",
    preco_tradicional: 42.0,
    preco_broto: 32.0,
    tipo: "salgada",
    ativo: true,
  },
  {
    id: "4",
    nome: "Frango Catupiry",
    descricao: "Molho de tomate, mussarela, frango desfiado, catupiry",
    preco_tradicional: 40.0,
    preco_broto: 30.0,
    tipo: "salgada",
    ativo: true,
  },
  {
    id: "5",
    nome: "Quatro Queijos",
    descricao: "Molho de tomate, mussarela, provolone, parmesão, gorgonzola",
    preco_tradicional: 45.0,
    preco_broto: 35.0,
    tipo: "salgada",
    ativo: true,
  },

  // Pizzas Doces
  {
    id: "6",
    nome: "Chocolate",
    descricao: "Chocolate ao leite derretido",
    preco_tradicional: 32.0,
    preco_broto: 22.0,
    tipo: "doce",
    ativo: true,
  },
  {
    id: "7",
    nome: "Brigadeiro",
    descricao: "Chocolate, leite condensado, granulado",
    preco_tradicional: 35.0,
    preco_broto: 25.0,
    tipo: "doce",
    ativo: true,
  },
  {
    id: "8",
    nome: "Romeu e Julieta",
    descricao: "Queijo minas, goiabada",
    preco_tradicional: 38.0,
    preco_broto: 28.0,
    tipo: "doce",
    ativo: true,
  },

  // Bebidas
  {
    id: "9",
    nome: "Coca-Cola 2L",
    descricao: "Refrigerante Coca-Cola 2 litros",
    preco_tradicional: 8.0,
    preco_broto: null,
    tipo: "bebida",
    ativo: true,
  },
  {
    id: "10",
    nome: "Guaraná Antarctica 2L",
    descricao: "Refrigerante Guaraná Antarctica 2 litros",
    preco_tradicional: 7.0,
    preco_broto: null,
    tipo: "bebida",
    ativo: true,
  },
  {
    id: "11",
    nome: "Água Mineral",
    descricao: "Água mineral 500ml",
    preco_tradicional: 3.0,
    preco_broto: null,
    tipo: "bebida",
    ativo: true,
  },
  {
    id: "12",
    nome: "Suco de Laranja",
    descricao: "Suco natural de laranja 500ml",
    preco_tradicional: 6.0,
    preco_broto: null,
    tipo: "bebida",
    ativo: true,
  },
]

export default function HomePage() {
  const [config, setConfig] = useState<PizzariaConfig>(mockConfig)
  const [produtos, setProdutos] = useState<Produto[]>(mockProdutos)
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})
  const [selectedPizza, setSelectedPizza] = useState<Produto | null>(null)
  const [showStoreInfo, setShowStoreInfo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      if (isSupabaseConfigured()) {
        // Try to load from Supabase
        const [configResult, produtosResult] = await Promise.all([
          supabase.from("pizzaria_config").select("*").single(),
          supabase.from("produtos").select("*").eq("ativo", true).order("ordem"),
        ])

        if (configResult.data) {
          setConfig(configResult.data)
        }

        if (produtosResult.data && produtosResult.data.length > 0) {
          setProdutos(produtosResult.data)
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
      // Keep using mock data on error
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const pizzasSalgadas = produtos.filter((p) => p.tipo === "salgada")
  const pizzasDoces = produtos.filter((p) => p.tipo === "doce")
  const bebidas = produtos.filter((p) => p.tipo === "bebida")

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando cardápio...</p>
        </div>
      </div>
    )
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header com foto de capa e perfil */}
        <div className="relative">
          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${config.foto_capa || "/placeholder.jpg"})` }}
          />
          <div className="absolute -bottom-12 left-4">
            <img
              src={config.foto_perfil || "/placeholder-logo.png"}
              alt="Logo da pizzaria"
              className="w-24 h-24 rounded-lg border-4 border-white shadow-lg object-cover"
            />
          </div>
        </div>

        <div className="px-4 pt-16 pb-4 ml-24">
          <h1 className="text-2xl font-bold text-gray-900">{config.nome}</h1>
        </div>

        {/* Menu horizontal com informações */}
        <div className="px-4 py-4 bg-white border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {config.tempo_entrega_min}–{config.tempo_entrega_max}
                </div>
                <div className="text-xs text-gray-500">minutos</div>
              </div>

              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">R${config.valor_minimo.toFixed(2)}</div>
                <div className="text-xs text-gray-500">mínimo</div>
              </div>

              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">ver taxas</div>
                <div className="text-xs text-gray-500">entregas</div>
              </div>

              <div className="text-center">
                <div className="flex justify-center items-center space-x-1 mb-1">
                  {config.aceita_dinheiro && <Banknote className="w-4 h-4" />}
                  {config.aceita_cartao && <CreditCard className="w-4 h-4" />}
                </div>
                <div className="text-xs text-gray-500">pagamento</div>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => setShowStoreInfo(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Cardápio */}
        <div className="px-4 py-4 space-y-4">
          {/* Seção Pizzas */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("pizzas")}>
                <h2 className="text-lg font-semibold">Pizzas</h2>
                {expandedSections.pizzas ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>

              {expandedSections.pizzas && (
                <div className="mt-4 space-y-4">
                  <div className="text-sm text-gray-600">
                    Pizzas doces e salgadas (Tradicional 8 fatias / Broto 4 fatias)
                  </div>
                  <div className="text-sm text-red-600">Você pode escolher até 2 sabores</div>

                  {/* Botões de seleção de sabores */}
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      className="flex-1 h-16 flex flex-col items-center justify-center bg-transparent"
                      onClick={() => {
                        /* Implementar seleção 1 sabor */
                      }}
                    >
                      <div className="w-8 h-8 aspect-square rounded-full bg-gray-200 border-2 border-gray-300 mb-1 flex-shrink-0"></div>
                      <span className="text-xs">1</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-16 flex flex-col items-center justify-center bg-transparent"
                      onClick={() => {
                        /* Implementar seleção 2 sabores */
                      }}
                    >
                      <div className="w-8 h-8 aspect-square rounded-full border-2 border-gray-300 relative mb-1 overflow-hidden flex-shrink-0">
                        <div className="absolute left-0 top-0 w-1/2 h-full bg-gray-200"></div>
                        <div className="absolute left-1/2 top-0 w-px h-full bg-gray-300"></div>
                      </div>
                      <span className="text-xs">2</span>
                    </Button>
                  </div>

                  {/* Lista de pizzas */}
                  <div className="space-y-3">
                    {[...pizzasSalgadas, ...pizzasDoces].map((pizza) => (
                      <div
                        key={pizza.id}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedPizza(pizza)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{pizza.nome}</h3>
                            {pizza.tipo === "doce" && (
                              <Badge variant="secondary" className="text-xs">
                                Doce
                              </Badge>
                            )}
                          </div>
                          {pizza.descricao && <p className="text-sm text-gray-600 mt-1">{pizza.descricao}</p>}
                          <div className="flex items-center space-x-4 mt-2">
                            {pizza.preco_broto && (
                              <span className="text-sm">Broto: R${pizza.preco_broto.toFixed(2)}</span>
                            )}
                            {pizza.preco_tradicional && (
                              <span className="text-sm font-medium">
                                Tradicional: R${pizza.preco_tradicional.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        <Plus className="w-5 h-5 text-red-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seção Bebidas */}
          <Card>
            <CardContent className="p-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("bebidas")}
              >
                <h2 className="text-lg font-semibold">Bebidas</h2>
                {expandedSections.bebidas ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>

              {expandedSections.bebidas && (
                <div className="mt-4 space-y-3">
                  {bebidas.map((bebida) => (
                    <div
                      key={bebida.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{bebida.nome}</h3>
                        {bebida.descricao && <p className="text-sm text-gray-600 mt-1">{bebida.descricao}</p>}
                        <span className="text-sm font-medium text-red-600">
                          R${bebida.preco_tradicional?.toFixed(2)}
                        </span>
                      </div>
                      <Plus className="w-5 h-5 text-red-600" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        {selectedPizza && (
          <PizzaSelectionModal pizza={selectedPizza} isOpen={!!selectedPizza} onClose={() => setSelectedPizza(null)} />
        )}

        <StoreInfoModal isOpen={showStoreInfo} onClose={() => setShowStoreInfo(false)} config={config} />

        {/* Carrinho fixo no rodapé */}
        <CartFooter />
      </div>
    </CartProvider>
  )
}
