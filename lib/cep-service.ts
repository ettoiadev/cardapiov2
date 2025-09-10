/**
 * Serviço para integração com a API ViaCEP
 * Fornece funcionalidades para busca de endereços por CEP
 */

export interface AddressData {
  cep: string
  logradouro: string
  complemento?: string
  bairro: string
  localidade: string
  uf: string
  ibge?: string
  gia?: string
  ddd?: string
  siafi?: string
  erro?: boolean
}

export interface CepSearchResult {
  success: boolean
  data?: AddressData
  error?: string
}

/**
 * Formata o CEP removendo caracteres não numéricos
 * @param cep - CEP a ser formatado
 * @returns CEP formatado com apenas números
 */
export const formatCep = (cep: string): string => {
  return cep.replace(/\D/g, '')
}

/**
 * Aplica máscara ao CEP (formato: 00000-000)
 * @param cep - CEP a ser mascarado
 * @returns CEP com máscara aplicada
 */
export const maskCep = (cep: string): string => {
  const cleanCep = formatCep(cep)
  return cleanCep
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9)
}

/**
 * Valida se o CEP possui formato correto (8 dígitos)
 * @param cep - CEP a ser validado
 * @returns true se o CEP é válido, false caso contrário
 */
export const isValidCep = (cep: string): boolean => {
  const cleanCep = formatCep(cep)
  return cleanCep.length === 8 && /^\d{8}$/.test(cleanCep)
}

/**
 * Busca informações de endereço através do CEP usando a API ViaCEP
 * @param cep - CEP a ser consultado
 * @returns Promise com resultado da busca
 */
export const searchCep = async (cep: string): Promise<CepSearchResult> => {
  const cleanCep = formatCep(cep)
  
  // Validar formato do CEP
  if (!isValidCep(cleanCep)) {
    return {
      success: false,
      error: 'CEP deve ter 8 dígitos'
    }
  }
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000)
    })
    
    if (!response.ok) {
      return {
        success: false,
        error: `Erro na requisição: ${response.status} ${response.statusText}`
      }
    }
    
    const data: AddressData = await response.json()
    
    // Verificar se o CEP foi encontrado
    if (data.erro) {
      return {
        success: false,
        error: 'CEP não encontrado'
      }
    }
    
    return {
      success: true,
      data
    }
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Timeout na consulta do CEP'
        }
      }
      return {
        success: false,
        error: `Erro na consulta: ${error.message}`
      }
    }
    
    return {
      success: false,
      error: 'Erro desconhecido ao consultar CEP'
    }
  }
}

/**
 * Formata o endereço completo a partir dos dados retornados pela API
 * @param addressData - Dados do endereço retornados pela ViaCEP
 * @returns Endereço formatado como string
 */
export const formatFullAddress = (addressData: AddressData): string => {
  const parts = []
  
  if (addressData.logradouro) {
    parts.push(addressData.logradouro)
  }
  
  if (addressData.bairro) {
    parts.push(addressData.bairro)
  }
  
  if (addressData.localidade && addressData.uf) {
    parts.push(`${addressData.localidade}/${addressData.uf}`)
  }
  
  return parts.join(', ')
}

/**
 * Hook personalizado para gerenciar busca de CEP em componentes React
 * @returns Objeto com estado e funções para busca de CEP
 */
export const useCepSearch = () => {
  const [isSearching, setIsSearching] = React.useState(false)
  const [addressData, setAddressData] = React.useState<AddressData | null>(null)
  const [error, setError] = React.useState<string>('')
  
  const search = async (cep: string) => {
    setIsSearching(true)
    setError('')
    setAddressData(null)
    
    const result = await searchCep(cep)
    
    if (result.success && result.data) {
      setAddressData(result.data)
    } else {
      setError(result.error || 'Erro ao buscar CEP')
    }
    
    setIsSearching(false)
  }
  
  const reset = () => {
    setAddressData(null)
    setError('')
    setIsSearching(false)
  }
  
  return {
    isSearching,
    addressData,
    error,
    search,
    reset
  }
}

// Importar React apenas se estiver em ambiente de componente
let React: any
try {
  React = require('react')
} catch {
  // React não disponível - hook não funcionará
}

export default {
  searchCep,
  formatCep,
  maskCep,
  isValidCep,
  formatFullAddress,
  useCepSearch
}