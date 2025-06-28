"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronUp, Plus, CreditCard, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { PizzaSelectionModal } from "@/components/pizza-selection-modal"
import { StoreInfoModal } from "@/components/store-info-modal"
import { CartFooter } from "@/components/cart-footer"
import { useCart } from "@/lib/cart-context"

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
}

interface Categoria {
  id: string
  nome: string
  descricao: string | null
}

interface Produto {
  id: string
  categoria_id: string | null
  nome: string
  descricao: string | null
  preco_tradicional: number | null
  preco_broto: number | null
  tipo: string
}

export default function HomePage() {
  const [config, setConfig] = useState<PizzariaConfig | null>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showPizzaModal, setShowPizzaModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const { dispatch } = useCart()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carregar configurações da pizzaria
      const { data: configData, error: configError } = await supabase.from("pizzaria_config").select("*").single()

      if (configError) {
        console.error("Erro ao carregar configurações:", configError)
        // Set default config if database is empty
        setConfig({
          id: "default",
          nome: "Pizzaria Bella Vista",
          foto_capa: null,
          foto_perfil: null,
          taxa_entrega: 5.0,
          tempo_entrega_min: 60,
          tempo_entrega_max: 90,
          valor_minimo: 20.0,
          aceita_dinheiro: true,
          aceita_cartao: true,
          endereco: "Rua das Flores, 123 - Centro",
          telefone: "(11) 3333-4444",
          whatsapp: "5511999887766",
        })
      } else if (configData) {
        setConfig(configData)
      }

      // Carregar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from("categorias")
        .select("*")
        .eq("ativo", true)
        .order("ordem")

      if (categoriasError) {
        console.error("Erro ao carregar categorias:", categoriasError)
        // Set default categories
        setCategorias([
          {
            id: "pizzas",
            nome: "Pizzas",
            descricao: "Pizzas doces e salgadas (Tradicional 8 fatias / Broto 4 fatias)",
          },
          { id: "bebidas", nome: "Bebidas", descricao: "Refrigerantes, sucos e águas" },
        ])
      } else if (categoriasData) {
        setCategorias(categoriasData)
      }

      // Carregar produtos
      const { data: produtosData, error: produtosError } = await supabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("ordem")

      if (produtosError) {
        console.error("Erro ao carregar produtos:", produtosError)
        // Set default products
        setProdutos([
          {
            id: "1",
            categoria_id: "pizzas",
            nome: "Margherita",
            descricao: "Molho de tomate, mussarela e manjericão",
            preco_tradicional: 35.0,
            preco_broto: 25.0,
            tipo: "salgada",
          },
          {
            id: "2",
            categoria_id: "pizzas",
            nome: "Pepperoni",
            descricao: "Molho de tomate, mussarela e pepperoni",
            preco_tradicional: 42.0,
            preco_broto: 32.0,
            tipo: "salgada",
          },
          {
            id: "3",
            categoria_id: "pizzas",
            nome: "Portuguesa",
            descricao: "Molho de tomate, mussarela, presunto, ovos, cebola e azeitona",
            preco_tradicional: 45.0,
            preco_broto: 35.0,
            tipo: "salgada",
          },
          {
            id: "4",
            categoria_id: "pizzas",
            nome: "Chocolate",
            descricao: "Chocolate ao leite derretido",
            preco_tradicional: 38.0,
            preco_broto: 28.0,
            tipo: "doce",
          },
          {
            id: "5",
            categoria_id: "pizzas",
            nome: "Brigadeiro",
            descricao: "Chocolate, granulado e leite condensado",
            preco_tradicional: 40.0,
            preco_broto: 30.0,
            tipo: "doce",
          },
          {
            id: "6",
            categoria_id: "bebidas",
            nome: "Coca-Cola 2L",
            descricao: "Refrigerante Coca-Cola 2 litros",
            preco_tradicional: 8.0,
            preco_broto: null,
            tipo: "bebida",
          },
          {
            id: "7",
            categoria_id: "bebidas",
            nome: "Guaraná Antarctica 2L",
            descricao: "Refrigerante Guaraná Antarctica 2 litros",
            preco_tradicional: 7.5,
            preco_broto: null,
            tipo: "bebida",
          },
          {
            id: "8",
            categoria_id: "bebidas",
            nome: "Água Mineral 500ml",
            descricao: "Água mineral sem gás",
            preco_tradicional: 3.0,
            preco_broto: null,
            tipo: "bebida",
          },
        ])
      } else if (produtosData) {
        setProdutos(produtosData)
      }
    } catch (error) {
      console.error("Erro geral ao carregar dados:", error)
      // Set all default data in case of connection issues
      setConfig({
        id: "default",
        nome: "Pizzaria Bella Vista",
        foto_capa: null,
        foto_perfil: null,
        taxa_entrega: 5.0,
        tempo_entrega_min: 60,
        tempo_entrega_max: 90,
        valor_minimo: 20.0,
        aceita_dinheiro: true,
        aceita_cartao: true,
        endereco: "Rua das Flores, 123 - Centro",
        telefone: "(11) 3333-4444",
        whatsapp: "5511999887766",
      })

      setCategorias([
        { id: "pizzas", nome: "Pizzas", descricao: "Pizzas doces e salgadas (Tradicional 8 fatias / Broto 4 fatias)" },
        { id: "bebidas", nome: "Bebidas", descricao: "Refrigerantes, sucos e águas" },
      ])

      setProdutos([
        {
          id: "1",
          categoria_id: "pizzas",
          nome: "Margherita",
          descricao: "Molho de tomate, mussarela e manjericão",
          preco_tradicional: 35.0,
          preco_broto: 25.0,
          tipo: "salgada",
        },
        {
          id: "2",
          categoria_id: "pizzas",
          nome: "Pepperoni",
          descricao: "Molho de tomate, mussarela e pepperoni",
          preco_tradicional: 42.0,
          preco_broto: 32.0,
          tipo: "salgada",
        },
        {
          id: "6",
          categoria_id: "bebidas",
          nome: "Coca-Cola 2L",
          descricao: "Refrigerante Coca-Cola 2 litros",
          preco_tradicional: 8.0,
          preco_broto: null,
          tipo: "bebida",
        },
      ])
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const addBebidaToCart = (produto: Produto) => {
    const cartItem = {
      id: `bebida-${Date.now()}`,
      produtoId: produto.id,
      nome: produto.nome,
      tamanho: "tradicional" as const,
      sabores: [produto.nome],
      quantidade: 1,
      precoUnitario: produto.preco_tradicional || 0,
      precoTotal: produto.preco_tradicional || 0,
      tipo: "bebida" as const,
    }

    dispatch({ type: "ADD_ITEM", payload: cartItem })
  }

  const pizzas = produtos.filter((p) => p.categoria_id === categorias.find((c) => c.nome === "Pizzas")?.id)
  const bebidas = produtos.filter((p) => p.categoria_id === categorias.find((c) => c.nome === "Bebidas")?.id)

  if (!config) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header com foto de capa e perfil */}
      <div className="relative">
        <div
          className="h-48 bg-gradient-to-r from-red-500 to-orange-500 bg-cover bg-center"
          style={{
            backgroundImage: config.foto_capa ? `url(${config.foto_capa})` : undefined,
          }}
        />
        <div className="absolute -bottom-8 right-4">
          <div
            className="w-16 h-16 bg-white rounded-lg shadow-lg bg-cover bg-center border-2 border-white"
            style={{
              backgroundImage: config.foto_perfil ? `url(${config.foto_perfil})` : undefined,
            }}
          />
        </div>
      </div>

      {/* Nome da pizzaria */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">{config.nome}</h1>
      </div>

      {/* Menu horizontal com informações */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-sm font-medium text-blue-600">Ver taxas</div>
              <div className="text-xs text-gray-500">entregas</div>
            </div>

            <div className="text-center">
              <div className="text-sm font-medium">
                {config.tempo_entrega_min}-{config.tempo_entrega_max}
              </div>
              <div className="text-xs text-gray-500">minutos</div>
            </div>

            <div className="text-center">
              <div className="text-sm font-medium">R$ {config.valor_minimo.toFixed(2)}</div>
              <div className="text-xs text-gray-500">mínimo</div>
            </div>

            <div className="text-center">
              <div className="flex space-x-1 justify-center">
                {config.aceita_dinheiro && <Banknote className="h-4 w-4" />}
                {config.aceita_cartao && <CreditCard className="h-4 w-4" />}
              </div>
              <div className="text-xs text-gray-500">pagamento</div>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => setShowInfoModal(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cardápio */}
      <div className="px-4 space-y-4">
        {categorias.map((categoria) => {
          const isExpanded = expandedCategories.has(categoria.id)
          const produtosCategoria = produtos.filter((p) => p.categoria_id === categoria.id)

          return (
            <Card key={categoria.id} className="overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  if (categoria.nome === "Pizzas") {
                    setShowPizzaModal(true)
                  } else {
                    toggleCategory(categoria.id)
                  }
                }}
              >
                <div>
                  <h2 className="text-lg font-semibold">{categoria.nome}</h2>
                  {categoria.descricao && <p className="text-sm text-gray-600 mt-1">{categoria.descricao}</p>}
                </div>
                {categoria.nome === "Pizzas" ? (
                  <Plus className="h-5 w-5 text-gray-400" />
                ) : isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {isExpanded && categoria.nome !== "Pizzas" && (
                <div className="border-t bg-gray-50">
                  <div className="p-4 space-y-3">
                    {produtosCategoria.map((produto) => (
                      <div key={produto.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{produto.nome}</h3>
                          {produto.descricao && <p className="text-sm text-gray-600 mt-1">{produto.descricao}</p>}
                          <p className="text-lg font-semibold text-green-600 mt-2">
                            R$ {produto.preco_tradicional?.toFixed(2)}
                          </p>
                        </div>
                        <Button onClick={() => addBebidaToCart(produto)} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Modals */}
      <PizzaSelectionModal isOpen={showPizzaModal} onClose={() => setShowPizzaModal(false)} pizzas={pizzas} />

      <StoreInfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} config={config} />

      {/* Cart Footer */}
      <CartFooter />
    </div>
  )
}
