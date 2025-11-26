"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrearPlanificacionPorTipoModal } from "@/features/planificacion/components/CrearPlanificacionPorTipoModal";

export default function PlanificacionTestPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [planificacionCreada, setPlanificacionCreada] = useState<any>(null);

  const handleConfirm = (planificacion: any) => {
    console.log("Planificación creada:", planificacion);
    setPlanificacionCreada(planificacion);
    setModalOpen(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Vista Previa: Planificación por Tipo
          </h1>
          <p className="text-muted-foreground mt-2">
            Esta es una vista previa del nuevo sistema de planificación por tipo
            de activo
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="lg">
          Abrir Modal de Planificación
        </Button>
      </div>

      {planificacionCreada && (
        <Card>
          <CardHeader>
            <CardTitle>Planificación Creada (JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px]">
              {JSON.stringify(planificacionCreada, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Características del Nuevo Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">✅ Planificación por Tipo</h3>
              <p className="text-sm text-muted-foreground">
                Define cuántos mantenimientos de cada tipo de activo (PC,
                PORTÁTIL, BIOMÉTRICO, etc.) se realizarán cada mes.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">✅ Vista de Tabla Completa</h3>
              <p className="text-sm text-muted-foreground">
                Visualiza los 12 meses del año y todos los tipos de activo en
                una sola tabla.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">✅ Totales Automáticos</h3>
              <p className="text-sm text-muted-foreground">
                Calcula automáticamente totales por mes, por tipo y total anual.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">✅ Un Solo Request</h3>
              <p className="text-sm text-muted-foreground">
                Toda la planificación se envía en un solo POST al backend.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-semibold text-orange-900 mb-2">
              📋 Estructura del Request
            </h3>
            <pre className="text-xs bg-white p-3 rounded overflow-auto">
              {`POST /planificacion/completa
{
  "ano": 2025,
  "planificacion": [
    {
      "mes": 1,
      "cuotas": [
        { "tipo": "PC", "planificado": 10 },
        { "tipo": "PORTÁTIL", "planificado": 5 },
        { "tipo": "BIOMÉTRICO", "planificado": 3 }
      ]
    },
    {
      "mes": 2,
      "cuotas": [
        { "tipo": "PC", "planificado": 8 },
        { "tipo": "PORTÁTIL", "planificado": 6 }
      ]
    }
    // ... hasta mes 12
  ]
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <CrearPlanificacionPorTipoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ano={2025}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
