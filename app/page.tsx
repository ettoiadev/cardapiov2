"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, CreditCard, Banknote, Check } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { CartProvider, useCart } from "@/lib/cart-context"
import { PizzaSelectionModal } from "@/components/pizza-selection-modal"
import { StoreInfoModal } from "@/components/store-info-modal"
import { CartFooter } from "@/components/cart-footer"
import { formatCurrency } from "@/lib/currency-utils"

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

function HomePageContent() {
  const [config, setConfig] = useState<PizzariaConfig>(mockConfig)
  const [produtos, setProdutos] = useState<Produto[]>(mockProdutos)
  const [opcoesSabores, setOpcoesSabores] = useState<any[]>([])
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})

  const [showStoreInfo, setShowStoreInfo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [flavorMode, setFlavorMode] = useState<1 | 2 | 3>(1)
  const [selectedFlavorsForMulti, setSelectedFlavorsForMulti] = useState<Produto[]>([])
  const [selectedSingleFlavor, setSelectedSingleFlavor] = useState<string | null>(null)

  const { dispatch } = useCart()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  // Processamento automático APENAS para múltiplos sabores (2 ou 3)
  useEffect(() => {
    if (flavorMode > 1 && selectedFlavorsForMulti.length === flavorMode) {
      // Para múltiplos sabores, adicionar ao carrinho e rolar para próxima categoria
      // SEM redirecionamento automático para checkout
      const timer = setTimeout(() => {
        // Adicionar ao carrinho primeiro
        const tamanho = "tradicional"
        const prices = selectedFlavorsForMulti.map(pizza => 
          pizza.preco_tradicional || 0
        )
        const preco = Math.max(...prices)
        const sabores = selectedFlavorsForMulti.map(p => p.nome)
        const nomeItem = `Pizza ${sabores.join(" + ")}`

        dispatch({
          type: "ADD_ITEM",
          payload: {
            id: `multi-${sabores.sort().join("-")}-${tamanho}`,
            nome: nomeItem,
            tamanho: tamanho,
            sabores: sabores,
            preco: preco,
            tipo: selectedFlavorsForMulti[0].tipo,
          },
        })
        
        // Rolar para a próxima categoria
        setTimeout(() => {
          scrollToNextCategory()
          
          // Reset da seleção APENAS após o scroll, para manter a visualização
          setTimeout(() => {
            setSelectedFlavorsForMulti([])
          }, 1000) // Aguardar 1 segundo após o scroll para resetar
        }, 500)
      }, 1000) // Aguardar 1 segundo para o usuário ver a seleção completa
      
      return () => clearTimeout(timer)
    }
  }, [flavorMode, selectedFlavorsForMulti, dispatch])

  const loadData = async () => {
    try {
      if (isSupabaseConfigured()) {
        // Try to load from Supabase
        const [configResult, produtosResult, opcoesResult] = await Promise.all([
          supabase.from("pizzaria_config").select("*").single(),
          supabase.from("produtos").select("*").eq("ativo", true).order("ordem"),
          supabase.from("opcoes_sabores").select("*").eq("ativo", true).order("ordem"),
        ])

        if (configResult.data) {
          setConfig(configResult.data)
        }

        if (produtosResult.data && produtosResult.data.length > 0) {
          setProdutos(produtosResult.data)
        }

        if (opcoesResult.data && opcoesResult.data.length > 0) {
          setOpcoesSabores(opcoesResult.data)
          
          // Verificar se o modo atual ainda está ativo
          const opcaoAtual = opcoesResult.data.find(o => o.maximo_sabores === flavorMode && o.ativo)
          if (!opcaoAtual) {
            // Se o modo atual não está ativo, voltar para 1 sabor
            setFlavorMode(1)
            setSelectedFlavorsForMulti([])
          }
        } else {
          // Fallback para opções padrão
          setOpcoesSabores([
            { id: "1", nome: "1 Sabor", maximo_sabores: 1, ordem: 1, ativo: true },
            { id: "2", nome: "2 Sabores", maximo_sabores: 2, ordem: 2, ativo: true },
            { id: "3", nome: "3 Sabores", maximo_sabores: 3, ordem: 3, ativo: true }
          ])
        }
      } else {
        // Usar opções padrão quando Supabase não estiver configurado
        setOpcoesSabores([
          { id: "1", nome: "1 Sabor", maximo_sabores: 1, ordem: 1, ativo: true },
          { id: "2", nome: "2 Sabores", maximo_sabores: 2, ordem: 2, ativo: true },
          { id: "3", nome: "3 Sabores", maximo_sabores: 3, ordem: 3, ativo: true }
        ])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      // Usar opções padrão em caso de erro
      setOpcoesSabores([
        { id: "1", nome: "1 Sabor", maximo_sabores: 1, ordem: 1, ativo: true },
        { id: "2", nome: "2 Sabores", maximo_sabores: 2, ordem: 2, ativo: true },
        { id: "3", nome: "3 Sabores", maximo_sabores: 3, ordem: 3, ativo: true }
      ])
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

  const scrollToNextCategory = () => {
    // Expandir automaticamente a seção de bebidas primeiro
    setExpandedSections(prev => ({ ...prev, bebidas: true }))
    
    // Aguardar a expansão e depois fazer scroll suave
    setTimeout(() => {
      const bebidasSection = document.querySelector('[data-section="bebidas"]')
      if (bebidasSection) {
        // Calcular posição de scroll considerando o header fixo e botão do carrinho
        const headerHeight = 60 // altura aproximada do header
        const elementTop = bebidasSection.getBoundingClientRect().top + window.pageYOffset
        const targetPosition = elementTop - headerHeight - 20 // 20px de margem adicional
        
        window.scrollTo({ 
          top: targetPosition,
          behavior: 'smooth'
        })
      }
    }, 200) // Aguardar a animação de expansão
  }

  const handleSingleFlavorSelection = (pizza: Produto) => {
    // Para 1 sabor: destaque visual, adicionar ao carrinho e scroll para bebidas
    setSelectedSingleFlavor(pizza.id)
    setSelectedFlavorsForMulti([pizza])
    
    // Adicionar diretamente ao carrinho
    const tamanho = "tradicional"
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: `${pizza.id}-${tamanho}`,
        nome: pizza.nome,
        tamanho: tamanho,
        sabores: [pizza.nome],
        preco: pizza.preco_tradicional || 0,
        tipo: pizza.tipo,
      },
    })
    
    // Scroll automático para a próxima categoria após um pequeno delay
    setTimeout(() => {
      scrollToNextCategory()
      // Reset da seleção após adicionar ao carrinho
      setSelectedFlavorsForMulti([])
    }, 500)
  }

  const handleMultiFlavorSelection = (pizza: Produto) => {
    // Para múltiplos sabores: comportamento de seleção toggle
    if (selectedFlavorsForMulti.find(p => p.id === pizza.id)) {
      // Remove se já estiver selecionado
      setSelectedFlavorsForMulti(prev => prev.filter(p => p.id !== pizza.id))
    } else if (selectedFlavorsForMulti.length < flavorMode) {
      // Adiciona se ainda não atingiu o limite
      setSelectedFlavorsForMulti(prev => [...prev, pizza])
    }
  }

  const handlePizzaSelection = (pizza: Produto) => {
    if (flavorMode === 1) {
      handleSingleFlavorSelection(pizza)
    } else {
      handleMultiFlavorSelection(pizza)
    }
  }

  const handleAddToCart = () => {
    if (selectedFlavorsForMulti.length !== flavorMode) return

    const tamanho = "tradicional" // Padrão tradicional, usuário pode editar no checkout

    // Calcula o maior preço entre os sabores selecionados
    const prices = selectedFlavorsForMulti.map(pizza => 
      pizza.preco_tradicional || 0 // Sempre usar preço tradicional por padrão
    )
    const preco = Math.max(...prices)

    const sabores = selectedFlavorsForMulti.map(p => p.nome)
    const nomeItem = flavorMode === 1 ? sabores[0] : `Pizza ${sabores.join(" + ")}`

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: flavorMode === 1 ? `${selectedFlavorsForMulti[0].id}-${tamanho}` : `multi-${sabores.sort().join("-")}-${tamanho}`,
        nome: nomeItem,
        tamanho: tamanho,
        sabores: sabores,
        preco: preco,
        tipo: selectedFlavorsForMulti[0].tipo,
      },
    })

    // Reset das seleções apenas para 1 sabor (múltiplos sabores são resetados no useEffect)
    if (flavorMode === 1) {
      setSelectedFlavorsForMulti([])
    }
  }

  const handleAddBebidaToCart = (bebida: Produto) => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: bebida.id,
        nome: bebida.nome,
        tamanho: "tradicional", // Bebidas não têm variação de tamanho
        sabores: [bebida.nome],
        preco: bebida.preco_tradicional || 0,
        tipo: bebida.tipo,
      },
    })

    // Bebida adicionada ao carrinho - usuário deve usar botão "Fechar pedido" para finalizar
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

        <div className="relative px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 ml-32">{config.nome}</h1>
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
                <div className="text-sm font-medium text-gray-900">{formatCurrency(config.valor_minimo)}</div>
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
        <div className="px-4 py-4 space-y-4 pb-24">
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
                  <div className="text-sm text-red-600">
                    Você pode escolher até {Math.max(...opcoesSabores.filter(o => o.ativo).map(o => o.maximo_sabores))} sabores
                  </div>

                  {/* Botões de seleção de sabores dinamicos */}
                  <div className="flex space-x-3">
                    {opcoesSabores.filter(opcao => opcao.ativo).map((opcao, index) => {
                      // Função para obter o caminho da imagem baseado na quantidade de sabores
                      const getImagePath = (maxSabores: number) => {
                        switch (maxSabores) {
                          case 1:
                            return "/images/sabores/1sabor.svg"
                          case 2:
                            return "/images/sabores/2sabores.svg"
                          case 3:
                            return "/images/sabores/3sabores.svg"
                          default:
                            return "/images/sabores/1sabor.svg"
                        }
                      }

                      return (
                        <Button
                          key={opcao.id}
                          variant="outline"
                          className={`flex-1 h-20 flex flex-col items-center justify-center bg-transparent transition-all duration-200 hover:shadow-md ${
                            flavorMode === opcao.maximo_sabores 
                              ? "border-teal-500 bg-teal-50 shadow-lg" 
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          onClick={() => {
                            setFlavorMode(opcao.maximo_sabores as 1 | 2 | 3)
                            setSelectedFlavorsForMulti([])
                            setSelectedSingleFlavor(null)
                          }}
                        >
                          <div className="w-8 h-8 mb-2 flex-shrink-0 flex items-center justify-center relative">
                            <Image
                              src={getImagePath(opcao.maximo_sabores)}
                              alt={`${opcao.maximo_sabores} sabor${opcao.maximo_sabores > 1 ? 'es' : ''}`}
                              width={32}
                              height={32}
                              className={`object-contain transition-all duration-200 ${
                                flavorMode === opcao.maximo_sabores 
                                  ? "scale-110 brightness-110" 
                                  : "opacity-80 hover:opacity-100"
                              }`}
                              priority={opcao.maximo_sabores <= 2} // Priorizar carregamento dos ícones mais comuns
                            />
                          </div>
                          <span className={`text-xs font-medium transition-colors duration-200 ${
                            flavorMode === opcao.maximo_sabores 
                              ? "text-teal-700" 
                              : "text-gray-600"
                          }`}>
                            {opcao.maximo_sabores}
                          </span>
                        </Button>
                      )
                    })}
                  </div>

                  {/* Lista de pizzas */}
                  <div className="space-y-3">
                    {[...pizzasSalgadas, ...pizzasDoces].map((pizza) => {
                      const isSelected = selectedFlavorsForMulti.find(p => p.id === pizza.id)
                      const isDisabled = selectedFlavorsForMulti.length >= flavorMode && !isSelected
                      const isSingleFlavorSelected = flavorMode === 1 && selectedSingleFlavor === pizza.id
                      
                      return (
                        <div
                          key={pizza.id}
                          className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                            flavorMode === 1
                              ? isSingleFlavorSelected
                                ? "cursor-pointer bg-red-50 border-red-300 hover:border-red-400"
                                : "cursor-pointer hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                              : flavorMode > 1 
                                ? (isSelected 
                                    ? "border-red-500 bg-red-50" 
                                    : isDisabled 
                                      ? "border-gray-200 opacity-50 cursor-not-allowed"
                                      : "border-gray-200 hover:border-gray-300 cursor-pointer")
                                : "cursor-pointer hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            if (!isDisabled) {
                              handlePizzaSelection(pizza)
                            }
                          }}
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
                              <span className="text-sm">Broto: {formatCurrency(pizza.preco_broto)}</span>
                            )}
                            {pizza.preco_tradicional && (
                              <span className="text-sm font-medium">
                                Tradicional: {formatCurrency(pizza.preco_tradicional)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {flavorMode > 1 && (
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-red-500 bg-red-500"
                              : "border-gray-300"
                          }`}>
                            {isSelected && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </div>
                        )}
                        
                        {flavorMode === 1 && (
                          <Plus className="w-5 h-5 text-red-600" />
                        )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Resumo dos sabores selecionados - APENAS para múltiplos sabores */}
                  {flavorMode > 1 && selectedFlavorsForMulti.length === flavorMode && (
                    <div className="space-y-3 pt-4 border-t bg-green-50 rounded-lg p-4 mx-2">
                      <div className="text-center">
                        <div className="text-sm text-gray-700 mb-2 font-medium">
                          Sabores selecionados: {selectedFlavorsForMulti.map(p => p.nome).join(" + ")}
                        </div>
                        <div className="text-sm text-green-600 font-bold">
                          ✓ Pizza adicionada ao carrinho!
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seção Bebidas */}
          <Card data-section="bebidas">
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
                      onClick={() => handleAddBebidaToCart(bebida)}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{bebida.nome}</h3>
                        {bebida.descricao && <p className="text-sm text-gray-600 mt-1">{bebida.descricao}</p>}
                        <span className="text-sm font-medium text-red-600">
                          {formatCurrency(bebida.preco_tradicional)}
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

        <StoreInfoModal isOpen={showStoreInfo} onClose={() => setShowStoreInfo(false)} config={config} />

        {/* Carrinho fixo no rodapé */}
        <CartFooter />
      </div>
  )
}

export default function HomePage() {
  return (
    <CartProvider>
      <HomePageContent />
    </CartProvider>
  )
}
