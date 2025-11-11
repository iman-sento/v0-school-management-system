import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  colorClass?: string
}

export function StatCard({ title, value, icon: Icon, description, trend, colorClass }: StatCardProps) {
  return (
    <Card className="bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-2 flex items-baseline gap-x-2">
              <p className="text-3xl font-semibold tracking-tight text-[#008268]">{value}</p>
              {trend && (
                <span className={cn("text-sm font-medium", trend.isPositive ? "text-green-600" : "text-red-600")}>
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className={cn("rounded-lg p-3", colorClass || "bg-primary/10")}>
            <Icon className={cn("h-6 w-6", colorClass ? "text-current" : "text-primary")} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
