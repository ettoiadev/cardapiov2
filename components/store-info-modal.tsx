"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Phone, Clock, Bike, Package } from "lucide-react"

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Informações da loja</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Bike className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-medium">Delivery</div>
              <div className="text-sm text-gray-600">
                Taxa: R${config.taxa_entrega.toFixed(2)} • {config.tempo_entrega_min}-{config.tempo_entrega_max} min
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Package className="w-5 h-5 text-red-600" />
            <div>
              <div className="font-medium">Balcão</div>
              <div className="text-sm text-gray-600">Retirada no local</div>
            </div>
          </div>

          {config.horario_funcionamento && (
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium">Horário de funcionamento</div>
                <div className="text-sm text-gray-600 space-y-1">
                  {Object.entries(config.horario_funcionamento).map(([dia, horario]) => (
                    <div key={dia} className="flex justify-between">
                      <span className="capitalize">{dia}:</span>
                      <span>{horario as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {config.endereco && (
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-medium">Endereço</div>
                <div className="text-sm text-gray-600">{config.endereco}</div>
              </div>
            </div>
          )}

          {config.telefone && (
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-medium">Telefone</div>
                <div className="text-sm text-gray-600">{config.telefone}</div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
