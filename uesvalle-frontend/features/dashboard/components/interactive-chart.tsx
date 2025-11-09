"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const chartData = [
  { sede: "Cali", activos: 456, disponibles: 420, mantenimiento: 24, malo: 12 },
  { sede: "Palmira", activos: 298, disponibles: 278, mantenimiento: 15, malo: 5 },
  { sede: "Tuluá", activos: 187, disponibles: 170, mantenimiento: 12, malo: 5 },
  { sede: "Buga", activos: 142, disponibles: 130, mantenimiento: 8, malo: 4 },
  { sede: "Cartago", activos: 98, disponibles: 88, mantenimiento: 6, malo: 4 },
  { sede: "Jamundí", activos: 64, disponibles: 58, mantenimiento: 4, malo: 2 },
]

const chartConfig = {
  disponibles: {
    label: "Disponibles",
    color: "hsl(var(--chart-1))",
  },
  mantenimiento: {
    label: "Mantenimiento",
    color: "hsl(var(--chart-2))",
  },
  malo: {
    label: "En mal estado",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function InteractiveChart() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Distribución de Activos por Sede</CardTitle>
        <CardDescription>
          Estado de equipos tecnológicos en cada ubicación de UESVALLE
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <XAxis
              dataKey="sede"
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey="disponibles"
              stackId="a"
              fill="var(--color-disponibles)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="mantenimiento"
              stackId="a"
              fill="var(--color-mantenimiento)"
            />
            <Bar
              dataKey="malo"
              stackId="a"
              fill="var(--color-malo)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}