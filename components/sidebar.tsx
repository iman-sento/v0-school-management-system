"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, BookOpen, Calendar, FileText, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "ダッシュボード", href: "/", icon: Home },
  { name: "生徒管理", href: "/students", icon: Users },
  { name: "実習管理", href: "/trainings", icon: BookOpen },
  { name: "イベント管理", href: "/events", icon: Calendar },
  { name: "成績管理", href: "/grades", icon: FileText },
  { name: "レポート", href: "/reports", icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-[#008268] text-white">
      <div className="flex h-full flex-col gap-y-5 px-6 py-8">
        <Link href="/" className="flex items-center gap-x-3" aria-label="ホーム">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
            <BookOpen className="h-6 w-6 text-[#008268]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-balance text-white">カワスイスクール</h1>
            <p className="text-xs text-white/80">管理システム</p>
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white text-[#008268]"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t pt-4">
          <p className="text-xs text-white/80">v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}
