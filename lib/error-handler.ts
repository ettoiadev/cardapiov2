/**
 * Utilitário para tratamento robusto de erros de API
 * Fornece fallbacks e logging estruturado para operações que podem falhar
 */

import { log } from './logger'

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface RetryOptions {
  maxRetries?: number
  delayMs?: number
  exponentialBackoff?: boolean
}

/**
 * Executa uma operação com retry automático e tratamento de erros
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<ApiResponse<T>> {
  const { maxRetries = 3, delayMs = 1000, exponentialBackoff = true } = options
  
  let lastError: any = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation()
      return {
        data: result,
        error: null,
        success: true
      }
    } catch (error) {
      lastError = error
      
      // Log do erro
      log.warn(`Tentativa ${attempt + 1}/${maxRetries + 1} falhou`, 'RETRY', {
        error: error instanceof Error ? error.message : String(error),
        attempt: attempt + 1,
        maxRetries: maxRetries + 1
      })
      
      // Se não é a última tentativa, aguarda antes de tentar novamente
      if (attempt < maxRetries) {
        const delay = exponentialBackoff ? delayMs * Math.pow(2, attempt) : delayMs
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  // Todas as tentativas falharam
  return {
    data: null,
    error: lastError instanceof Error ? lastError.message : String(lastError),
    success: false
  }
}

/**
 * Wrapper para operações do Supabase com tratamento de erros
 */
export async function supabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  fallbackData?: T,
  retryOptions?: RetryOptions
): Promise<ApiResponse<T>> {
  const result = await withRetry(async () => {
    const { data, error } = await operation()
    
    if (error) {
      throw new Error(`Supabase Error: ${error.message || error.code || 'Unknown error'}`)
    }
    
    return data
  }, retryOptions)
  
  // Se falhou e temos fallback, usar o fallback
  if (!result.success && fallbackData !== undefined) {
    log.warn('Usando dados de fallback devido a erro na API', 'SUPABASE', {
      error: result.error,
      fallbackUsed: true
    })
    return {
      data: fallbackData,
      error: null,
      success: true
    }
  }
  
  return result
}

/**
 * Dados de fallback para quando as APIs falham
 */
export const fallbackData = {
  pizzariaConfig: {
    id: 'fallback-config',
    nome: 'Pizzaria Demo',
    telefone: '(11) 99999-9999',
    whatsapp: '5511999999999',
    endereco: 'Rua das Pizzas, 123 - Centro',
    horario_funcionamento: {
      segunda: '18:00-23:00',
      terca: '18:00-23:00',
      quarta: '18:00-23:00',
      quinta: '18:00-23:00',
      sexta: '18:00-23:00',
      sabado: '18:00-23:00',
      domingo: '18:00-23:00'
    },
    taxa_entrega: 5.00,
    valor_minimo: 25.00,
    aceita_dinheiro: true,
    aceita_cartao: true,
    aceita_pix: true,
    habilitar_broto: true,
    habilitar_bordas_recheadas: true
  },
  
  categorias: [
    { id: 'fallback-1', nome: 'Pizzas Salgadas', ativo: true, ordem: 1, multi_sabores_habilitado: true },
    { id: 'fallback-2', nome: 'Pizzas Doces', ativo: true, ordem: 2, multi_sabores_habilitado: true },
    { id: 'fallback-3', nome: 'Bebidas', ativo: true, ordem: 3, multi_sabores_habilitado: false }
  ],
  
  produtos: [
    {
      id: 'fallback-pizza-1',
      categoria_id: 'fallback-1',
      nome: 'Margherita',
      descricao: 'Molho de tomate, mussarela e manjericão',
      preco_tradicional: 35.00,
      preco_broto: 25.00,
      tipo: 'pizza',
      ativo: true,
      promocao: false,
      ordem: 1
    },
    {
      id: 'fallback-pizza-2',
      categoria_id: 'fallback-1',
      nome: 'Calabresa',
      descricao: 'Molho de tomate, mussarela, calabresa e cebola',
      preco_tradicional: 38.00,
      preco_broto: 28.00,
      tipo: 'pizza',
      ativo: true,
      promocao: false,
      ordem: 2
    },
    {
      id: 'fallback-pizza-3',
      categoria_id: 'fallback-2',
      nome: 'Chocolate',
      descricao: 'Chocolate ao leite derretido',
      preco_tradicional: 32.00,
      preco_broto: 22.00,
      tipo: 'pizza',
      ativo: true,
      promocao: false,
      ordem: 3
    },
    {
      id: 'fallback-bebida-1',
      categoria_id: 'fallback-3',
      nome: 'Coca-Cola 2L',
      descricao: 'Refrigerante Coca-Cola 2 litros',
      preco_tradicional: 8.00,
      preco_broto: null,
      tipo: 'bebida',
      ativo: true,
      promocao: false,
      ordem: 4
    }
  ],
  
  tamanhosPizza: [
    { id: 'fallback-1', nome: 'Tradicional', ativo: true, ordem: 1 },
    { id: 'fallback-2', nome: 'Broto', ativo: true, ordem: 2 }
  ],
  
  opcoesSabores: [
    { id: 'fallback-1', nome: '1 Sabor', maximo_sabores: 1, ativo: true, ordem: 1 },
    { id: 'fallback-2', nome: '2 Sabores', maximo_sabores: 2, ativo: true, ordem: 2 }
  ]
}

/**
 * Hook para monitoramento de saúde da API
 */
export class ApiHealthMonitor {
  private static instance: ApiHealthMonitor
  private healthStatus: Map<string, boolean> = new Map()
  private lastCheck: Map<string, number> = new Map()
  
  static getInstance(): ApiHealthMonitor {
    if (!ApiHealthMonitor.instance) {
      ApiHealthMonitor.instance = new ApiHealthMonitor()
    }
    return ApiHealthMonitor.instance
  }
  
  async checkHealth(endpoint: string, checkFn: () => Promise<boolean>): Promise<boolean> {
    const now = Date.now()
    const lastCheckTime = this.lastCheck.get(endpoint) || 0
    
    // Só verifica novamente se passou mais de 30 segundos
    if (now - lastCheckTime < 30000) {
      return this.healthStatus.get(endpoint) || false
    }
    
    try {
      const isHealthy = await checkFn()
      this.healthStatus.set(endpoint, isHealthy)
      this.lastCheck.set(endpoint, now)
      
      if (!isHealthy) {
        log.warn(`Endpoint não está saudável`, 'HEALTH', { endpoint })
      }
      
      return isHealthy
    } catch (error) {
      log.error(`Erro ao verificar saúde do endpoint`, 'HEALTH', { endpoint }, error instanceof Error ? error : new Error(String(error)))
      this.healthStatus.set(endpoint, false)
      this.lastCheck.set(endpoint, now)
      return false
    }
  }
  
  getStatus(endpoint: string): boolean {
    return this.healthStatus.get(endpoint) || false
  }
  
  getAllStatus(): Record<string, boolean> {
    return Object.fromEntries(this.healthStatus)
  }
}