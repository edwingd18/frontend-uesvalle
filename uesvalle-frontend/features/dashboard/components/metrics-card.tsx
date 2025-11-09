import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface MetricsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
    label: string
  }
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  className?: string
}

export function MetricsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  className
}: MetricsCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-all duration-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
          {title}
          {badge && (
            <Badge variant={badge.variant || "secondary"} className="text-xs">
              {badge.text}
            </Badge>
          )}
        </CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>

        {trend && (
          <div className="flex items-center gap-1">
            <div className={cn(
              "flex items-center text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <span className={cn(
                "mr-1",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}>
                {trend.isPositive ? "↗" : "↘"}
              </span>
              {trend.value}
            </div>
            <span className="text-xs text-gray-500">{trend.label}</span>
          </div>
        )}

        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}