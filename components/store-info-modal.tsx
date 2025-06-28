"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, Bike, Package, ThumbsUp } from "lucide-react"

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

interface StoreInfoModalProps {
  isOpen: boolean
  onClose: () => void
  config: PizzariaConfig
}

export function StoreInfoModal({ isOpen, onClose, config }: StoreInfoModalProps) {
  const formatDayName = (day: string) => {
    const days: { [key: string]: string } = {
      segunda: "segunda",
      terca: "terça", 
      quarta: "quarta",
      quinta: "quinta",
      sexta: "sexta",
      sabado: "sábado",
      domingo: "domingo"
    }
    return days[day] || day
  }

  const formatSchedule = (schedule: string) => {
    if (!schedule || schedule.toLowerCase() === 'fechado') {
      return 'Fechado'
    }
    return schedule
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm mx-4 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg text-teal-600 font-normal">algumas infos sobre essa loja</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cards Delivery e Balcão lado a lado */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-300 rounded-lg p-4 text-center">
              <Bike className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-700">delivery</div>
            </div>
            <div className="border border-gray-300 rounded-lg p-4 text-center">
              <Package className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-700">balcão</div>
            </div>
          </div>

          {/* Mensagem sobre cupons */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-gray-700">ela aceita cupons :)</span>
              <ThumbsUp className="w-4 h-4 text-gray-600 fill-current" />
            </div>
          </div>

          {/* Horários de funcionamento */}
          {config.horario_funcionamento && (
            <div>
              <h3 className="text-teal-600 font-medium mb-3">horários de funcionamento</h3>
              <div className="space-y-1 text-sm text-gray-600">
                {Object.entries(config.horario_funcionamento).map(([dia, horario]) => (
                  <div key={dia} className="flex justify-between">
                    <span>{formatDayName(dia)}:</span>
                    <span>{formatSchedule(horario as string)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Endereço */}
          {config.endereco && (
            <div>
              <h3 className="text-teal-600 font-medium mb-2">endereço:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>{config.endereco}</div>
                <div>26.429.165/0001-77</div>
              </div>
            </div>
          )}

          {/* Botão Abrir Mapa */}
          <Button 
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded"
            onClick={() => {
              // Implementar abertura do mapa
              console.log('Abrir mapa')
            }}
          >
            abrir mapa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
