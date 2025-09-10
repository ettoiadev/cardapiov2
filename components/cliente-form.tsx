"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MapPin, Phone, User, Home } from "lucide-react"
import { useClientes, type ClienteFormData, type Cliente } from "@/lib/clientes-context"
import { maskCep, formatFullAddress } from "@/lib/cep-service"
import { useToast } from "@/components/ui/use-toast"

interface ClienteFormProps {
  cliente?: Cliente | null
  onSuccess?: (cliente: Cliente) => void
  onCancel?: () => void
  mode?: 'create' | 'edit'
}

export function ClienteForm({ cliente, onSuccess, onCancel, mode = 'create' }: ClienteFormProps) {
  const { createCliente, updateCliente, searchCepData, loading, error, clearError } = useClientes()
  const { toast } = useToast()
  
  // Form state
  const [formData, setFormData] = useState<ClienteFormData>({
    nome_completo: '',
    telefone: '',
    cep: '',
    endereco_completo: '',
    numero: '',
    complemento: ''
  })
  
  // CEP search state
  const [searchingCep, setSearchingCep] = useState(false)
  const [cepError, setCepError] = useState('')
  const [addressFound, setAddressFound] = useState(false)
  
  // Form validation state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  // Initialize form with cliente data if editing
  useEffect(() => {
    if (cliente && mode === 'edit') {
      setFormData({
        nome_completo: cliente.nome_completo,
        telefone: cliente.telefone,
        cep: cliente.cep,
        endereco_completo: cliente.endereco_completo,
        numero: cliente.numero,
        complemento: cliente.complemento || ''
      })
      setAddressFound(true)
    }
  }, [cliente, mode])
  
  // Clear errors when form data changes
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [formData, error, clearError])
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout)
      }
    }
  }, [validationTimeout])
  
  // Handle input changes with real-time validation
  const handleInputChange = (field: keyof ClienteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Real-time validation for better UX
    const error = validateField(field, value)
    setFieldErrors(prev => ({ ...prev, [field]: error }))
  }
  
  // Debounced validation for performance
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const handleInputChangeWithDebounce = (field: keyof ClienteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear previous timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout)
    }
    
    // Clear error immediately when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Set new timeout for validation
    const timeout = setTimeout(() => {
      const error = validateField(field, value)
      setFieldErrors(prev => ({ ...prev, [field]: error }))
    }, 500) // 500ms debounce
    
    setValidationTimeout(timeout)
  }
  
  // Handle CEP change with mask and search
  const handleCepChange = async (value: string) => {
    const maskedCep = maskCep(value)
    setFormData(prev => ({ ...prev, cep: maskedCep }))
    
    setCepError('')
    setAddressFound(false)
    
    // Clear CEP field error immediately
    if (fieldErrors.cep) {
      setFieldErrors(prev => ({ ...prev, cep: '' }))
    }
    
    // Search CEP when complete
    const cleanCep = maskedCep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      setSearchingCep(true)
      
      try {
        const addressData = await searchCepData(maskedCep)
        
        if (addressData) {
          const fullAddress = formatFullAddress(addressData)
          setFormData(prev => ({ ...prev, endereco_completo: fullAddress }))
          setAddressFound(true)
          setCepError('')
          
          // Clear address error if it was set
          if (fieldErrors.endereco_completo) {
            setFieldErrors(prev => ({ ...prev, endereco_completo: '' }))
          }
        } else {
          setCepError('CEP não encontrado')
          setFormData(prev => ({ ...prev, endereco_completo: '' }))
          setFieldErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }))
        }
      } catch (err) {
        const errorMsg = 'Erro ao buscar CEP. Verifique sua conexão'
        setCepError(errorMsg)
        setFormData(prev => ({ ...prev, endereco_completo: '' }))
        setFieldErrors(prev => ({ ...prev, cep: errorMsg }))
        console.error('Erro ao buscar CEP:', err)
      } finally {
        setSearchingCep(false)
      }
    } else {
      setFormData(prev => ({ ...prev, endereco_completo: '' }))
      
      // Validate CEP format if user stopped typing
      setTimeout(() => {
        if (cleanCep.length > 0 && cleanCep.length < 8) {
          setFieldErrors(prev => ({ ...prev, cep: 'CEP deve ter 8 dígitos' }))
        }
      }, 1000)
    }
  }
  
  // Handle phone mask with validation
  const handlePhoneChange = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Apply mask based on length
    let masked = digits
    if (digits.length >= 2) {
      masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    }
    if (digits.length >= 7) {
      const ddd = digits.slice(0, 2)
      const firstPart = digits.slice(2, digits.length === 10 ? 6 : 7)
      const secondPart = digits.slice(digits.length === 10 ? 6 : 7, digits.length)
      masked = `(${ddd}) ${firstPart}-${secondPart}`
    }
    
    // Limit to 15 characters total
    masked = masked.slice(0, 15)
    
    handleInputChangeWithDebounce('telefone', masked)
  }
  
  // Validate individual field
  const validateField = (field: keyof ClienteFormData, value: string): string => {
    switch (field) {
      case 'nome_completo':
        if (!value.trim()) return 'Nome completo é obrigatório'
        if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres'
        if (value.trim().length > 100) return 'Nome não pode ter mais de 100 caracteres'
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) return 'Nome deve conter apenas letras e espaços'
        return ''
        
      case 'telefone':
        if (!value.trim()) return 'Telefone é obrigatório'
        const phoneDigits = value.replace(/\D/g, '')
        if (phoneDigits.length < 10) return 'Telefone deve ter pelo menos 10 dígitos'
        if (phoneDigits.length > 11) return 'Telefone não pode ter mais de 11 dígitos'
        if (phoneDigits.length === 11 && !phoneDigits.startsWith('1', 2)) {
          return 'Celular deve começar com 9 após o DDD'
        }
        return ''
        
      case 'cep':
        if (!value.trim()) return 'CEP é obrigatório'
        const cepDigits = value.replace(/\D/g, '')
        if (cepDigits.length !== 8) return 'CEP deve ter 8 dígitos'
        if (!/^[0-9]{8}$/.test(cepDigits)) return 'CEP deve conter apenas números'
        return ''
        
      case 'endereco_completo':
        if (!value.trim()) return 'Endereço é obrigatório'
        if (value.trim().length < 5) return 'Endereço deve ter pelo menos 5 caracteres'
        return ''
        
      case 'numero':
        if (!value.trim()) return 'Número é obrigatório'
        if (!/^[0-9A-Za-z\s\-\/]+$/.test(value.trim())) return 'Número deve conter apenas letras, números, espaços e hífens'
        if (value.trim().length > 10) return 'Número não pode ter mais de 10 caracteres'
        return ''
        
      case 'complemento':
        if (value && value.length > 50) return 'Complemento não pode ter mais de 50 caracteres'
        return ''
        
      default:
        return ''
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    // Validate all required fields
    Object.keys(formData).forEach(key => {
      const field = key as keyof ClienteFormData
      const error = validateField(field, formData[field] || '')
      if (error) {
        errors[field] = error
      }
    })
    
    // Additional cross-field validations
    if (!errors.cep && !addressFound && formData.cep.replace(/\D/g, '').length === 8) {
      errors.cep = 'CEP não foi encontrado. Verifique se está correto'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  // Handle form submission with comprehensive error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear any previous errors
    setError(null)
    
    // Validate form before submission
    if (!validateForm()) {
      const errorCount = Object.keys(fieldErrors).filter(key => fieldErrors[key]).length
      toast({
        title: "Erro de validação",
        description: `Por favor, corrija ${errorCount} erro${errorCount > 1 ? 's' : ''} no formulário`,
        variant: "destructive"
      })
      
      // Focus on first field with error
      const firstErrorField = Object.keys(fieldErrors).find(key => fieldErrors[key])
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField)
        element?.focus()
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      
      return
    }
    
    // Additional validation for CEP
    if (!addressFound && formData.cep.replace(/\D/g, '').length === 8) {
      toast({
        title: "CEP não validado",
        description: "Por favor, aguarde a validação do CEP ou verifique se está correto",
        variant: "destructive"
      })
      return
    }
    
    try {
      let result: Cliente | null = null
      
      if (mode === 'create') {
        result = await createCliente(formData)
      } else if (cliente) {
        result = await updateCliente(cliente.id, formData)
      }
      
      if (result) {
        toast({
          title: mode === 'create' ? "✅ Cliente cadastrado" : "✅ Cliente atualizado",
          description: mode === 'create' 
            ? `Cliente ${result.nome_completo} cadastrado com sucesso!` 
            : `Dados de ${result.nome_completo} atualizados com sucesso!`,
          variant: "default"
        })
        
        // Reset form if creating
        if (mode === 'create') {
          setFormData({
            nome_completo: '',
            telefone: '',
            cep: '',
            endereco_completo: '',
            numero: '',
            complemento: ''
          })
          setFieldErrors({})
          setAddressFound(false)
          setCepError('')
        }
        
        onSuccess?.(result)
      } else {
        // Handle case where operation didn't return a result
        throw new Error('Operação não retornou resultado')
      }
    } catch (err) {
      console.error('Erro ao salvar cliente:', err)
      
      let errorMessage = 'Erro inesperado ao salvar cliente'
      let errorTitle = 'Erro'
      
      if (err instanceof Error) {
        // Handle specific error types
        if (err.message.includes('duplicate') || err.message.includes('unique')) {
          errorMessage = 'Já existe um cliente com estes dados. Verifique telefone ou CPF.'
          errorTitle = 'Dados duplicados'
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
          errorTitle = 'Erro de conexão'
        } else if (err.message.includes('permission') || err.message.includes('unauthorized')) {
          errorMessage = 'Você não tem permissão para realizar esta operação.'
          errorTitle = 'Sem permissão'
        } else if (err.message.includes('validation')) {
          errorMessage = 'Dados inválidos. Verifique as informações e tente novamente.'
          errorTitle = 'Dados inválidos'
        } else {
          errorMessage = err.message || errorMessage
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      })
    }
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {mode === 'create' ? 'Cadastrar Cliente' : 'Editar Cliente'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Preencha os dados do cliente para cadastro'
            : 'Atualize os dados do cliente'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome Completo */}
          <div className="space-y-2">
            <Label htmlFor="nome_completo">Nome Completo *</Label>
            <Input
              id="nome_completo"
              placeholder="Digite o nome completo"
              value={formData.nome_completo}
              onChange={(e) => handleInputChangeWithDebounce('nome_completo', e.target.value)}
              className={fieldErrors.nome_completo ? 'border-red-500 focus:border-red-500' : ''}
              maxLength={100}
            />
            {fieldErrors.nome_completo && (
              <p className="text-red-600 text-sm">{fieldErrors.nome_completo}</p>
            )}
          </div>
          
          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="telefone"
                placeholder="(11) 99999-9999"
                value={formData.telefone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`pl-10 ${fieldErrors.telefone ? 'border-red-500' : ''}`}
              />
            </div>
            {fieldErrors.telefone && (
              <p className="text-red-600 text-sm">{fieldErrors.telefone}</p>
            )}
          </div>
          
          {/* CEP */}
          <div className="space-y-2">
            <Label htmlFor="cep">CEP *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="cep"
                placeholder="00000-000"
                value={formData.cep}
                onChange={(e) => handleCepChange(e.target.value)}
                className={`pl-10 ${fieldErrors.cep || cepError ? 'border-red-500' : ''}`}
              />
              {searchingCep && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
              )}
            </div>
            {(fieldErrors.cep || cepError) && (
              <p className="text-red-600 text-sm">{fieldErrors.cep || cepError}</p>
            )}
          </div>
          
          {/* Endereço Completo */}
          {addressFound && (
            <div className="space-y-2">
              <Label htmlFor="endereco_completo">Endereço Encontrado</Label>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 font-medium">📍 Endereço:</p>
                <p className="text-green-700">{formData.endereco_completo}</p>
              </div>
            </div>
          )}
          
          {/* Número */}
          <div className="space-y-2">
            <Label htmlFor="numero">Número *</Label>
            <div className="relative">
              <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="numero"
                placeholder="123"
                value={formData.numero}
                onChange={(e) => handleInputChangeWithDebounce('numero', e.target.value)}
                className={`pl-10 ${fieldErrors.numero ? 'border-red-500 focus:border-red-500' : ''}`}
                maxLength={10}
              />
            </div>
            {fieldErrors.numero && (
              <p className="text-red-600 text-sm">{fieldErrors.numero}</p>
            )}
          </div>
          
          {/* Complemento */}
          <div className="space-y-2">
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              placeholder="Apartamento, bloco, etc. (opcional)"
              value={formData.complemento}
              onChange={(e) => handleInputChangeWithDebounce('complemento', e.target.value)}
              maxLength={50}
            />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading || searchingCep}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Cadastrar Cliente' : 'Atualizar Cliente'}
            </Button>
            
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default ClienteForm