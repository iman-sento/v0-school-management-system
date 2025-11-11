import dynamic from "next/dynamic"
const Sidebar = dynamic(() => import("@/components/sidebar").then((m) => m.Sidebar), { ssr: false })
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { calculateAttendanceRate } from "@/lib/utils/stats"
import { BarChart3, Download, FileText, TrendingUp, Users, BookOpen } from "lucide-react"

export default async function ReportsPage() {
  const [students, attendanceRecords, courses, sessions, grades] = await Promise.all([
    db.students.getAll(),
    db.attendanceRecords.getAll(),
    db.trainingCourses.getAll(),
    db.trainingSessions.getAll(),
    db.gradeRecords.getAll(),
  ])

  const activeStudents = students.filter((s) => s.status === "在籍").length
  const completedSessions = sessions.filter((s) => s.status === "完了").length
  const overallAttendanceRate = calculateAttendanceRate(attendanceRecords)
  const gradesCount = grades.length

  return (
    <div className="flex min-h-screen bg-[#008268]">
      <Sidebar />

      <main className="ml-64 flex-1 bg-white p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">レポート</h1>
              <p className="mt-2 text-muted-foreground">学校全体の統計と分析</p>
            </div>
            <Button size="lg">
              <Download className="mr-2 h-4 w-4" />
              レポート出力
            </Button>
          </div>

          {/* サマリー統計 */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#008268]/10">
                    <Users className="h-6 w-6 text-[#008268]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">在籍生徒</p>
                    <p className="text-2xl font-bold text-[#008268]">{activeStudents}名</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#008268]/10">
                    <BookOpen className="h-6 w-6 text-[#008268]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">完了実習</p>
                    <p className="text-2xl font-bold text-[#008268]">{completedSessions}回</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#008268]/10">
                    <TrendingUp className="h-6 w-6 text-[#008268]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">全体出席率</p>
                    <p className="text-2xl font-bold text-[#008268]">{overallAttendanceRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#008268]/10">
                    <FileText className="h-6 w-6 text-[#008268]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">評価記録</p>
                    <p className="text-2xl font-bold text-[#008268]">{gradesCount}件</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 詳細レポート（簡易表示） */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>詳細レポート</CardTitle>
              <CardDescription>グラフは一時的に無効化しています。サマリーをご確認ください。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">開講科目数</p>
                  <p className="mt-1 text-2xl font-semibold text-[#008268]">{courses.length}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">総セッション数</p>
                  <p className="mt-1 text-2xl font-semibold text-[#008268]">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* クイックレポート */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer bg-white transition-colors hover:bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-[#008268]" />
                  <div>
                    <p className="font-semibold">月次レポート</p>
                    <p className="text-sm text-muted-foreground">今月の活動まとめ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer bg-white transition-colors hover:bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-[#008268]" />
                  <div>
                    <p className="font-semibold">生徒別レポート</p>
                    <p className="text-sm text-muted-foreground">個別の学習状況</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer bg-white transition-colors hover:bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-[#008268]" />
                  <div>
                    <p className="font-semibold">科目別レポート</p>
                    <p className="text-sm text-muted-foreground">実習科目の分析</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
