"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InteractiveChartProps {
  data: Array<{
    sede: string;
    cantidad: number;
  }>;
}

export function InteractiveChart({ data }: InteractiveChartProps) {
  // Acortar nombres de sedes
  const formattedData = data.map((item) => ({
    ...item,
    sedeCorta: item.sede
      .replace("Cali - Sede Principal", "Cali")
      .replace("Sede Principal", "Principal"),
  }));

  const maxCantidad = Math.max(...formattedData.map((d) => d.cantidad), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Distribución por Sede</CardTitle>
        <CardDescription className="text-xs">
          Activos por ubicación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {formattedData
            .sort((a, b) => b.cantidad - a.cantidad)
            .map((item) => {
              const porcentaje = (item.cantidad / maxCantidad) * 100;

              return (
                <div key={item.sede} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.sedeCorta}</span>
                    <span className="text-muted-foreground font-semibold">
                      {item.cantidad}
                    </span>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${porcentaje}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        {item.cantidad}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
}
