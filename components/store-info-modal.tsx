"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Clock, Bike, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StoreInfoModalProps {
  isOpen: boolean
  onClose: () => void
  config: {
    nome: string
    endereco: string | null
    telefone: string | null
  }
}

export function StoreInfoModal({ isOpen, onClose, config }: StoreInfoModalProps) {
  const handleOpenMap = () => {
    if (config.endereco) {
      const encodedAddress = encodeURIComponent(config.endereco)
      window.open(`https://maps.google.com/?q=${encodedAddress}`, "_blank")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Informações da Loja</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start space-x-3">
            <Bike className="h-5 w-5 mt-1 text-green-600" />
            <div>
              <h3 className="font-medium">Delivery</h3>
              <p className="text-sm text-muted-foreground">Entregamos na sua casa</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Package className="h-5 w-5 mt-1 text-blue-600" />
            <div>
              <h3 className="font-medium">Balcão</h3>
              <p className="text-sm text-muted-foreground">Retire no local</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 mt-1 text-orange-600" />
            <div>
              <h3 className="font-medium">Horário de Funcionamento</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Segunda a Quinta: 18h às 23h</p>
                <p>Sexta e Sábado: 18h às 00h</p>
                <p>Domingo: 18h às 22h</p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 mt-1 text-red-600" />
            <div className="flex-1">
              <h3 className="font-medium">Endereço</h3>
              <p className="text-sm text-muted-foreground mb-2">{config.endereco}</p>
              <Button variant="outline" size="sm" onClick={handleOpenMap}>
                Abrir no Mapa
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
