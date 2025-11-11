import { Sidebar } from "@/components/sidebar"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Calendar, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { db } from "@/lib/db"
import { calculateAttendanceRate } from "@/lib/utils/stats"
import { formatDate } from "@/lib/utils/stats"
import Link from "next/link"

export default async function DashboardPage() {
  const [students, trainingSessions, events, attendanceRecords] = await Promise.all([
    db.students.getAll(),
    db.trainingSessions.getAll(),
    db.events.getAll(),
    db.attendanceRecords.getAll(),
  ])

  const activeStudents = students.filter((s) => s.status === "在籍").length
  const upcomingSessions = trainingSessions.filter((s) => s.status === "予定").length
  const upcomingEvents = events.filter((e) => e.status === "募集中").length
  const overallAttendanceRate = calculateAttendanceRate(attendanceRecords)

  // 最近の実習セッション
  const recentSessions = trainingSessions
    .filter((s) => s.status === "完了")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // 今日の予定
  const today = new Date().toISOString().split("T")[0]
  const todaySessions = trainingSessions.filter((s) => s.date === today)

  // 注意が必要な生徒（出席率が低い）
  const studentsNeedingAttention = await Promise.all(
    students.slice(0, 3).map(async (student) => {
      const records = await db.attendanceRecords.getByStudentId(student.id)
      const rate = calculateAttendanceRate(records)
      return { student, attendanceRate: rate }
    }),
  )

  return (
    <div className="flex min-h-screen bg-[#008268]">
      <Sidebar />

      <main className="ml-64 flex-1 bg-white p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* ヘッダー */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-balance">ダッシュボード</h1>
            <p className="mt-2 text-muted-foreground">カワスイ アクア&アニマルスクール 管理システム</p>
          </div>

          {/* 統計カード */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="在籍生徒数"
              value={activeStudents}
              icon={Users}
              description={`全生徒数: ${students.length}名`}
              colorClass="bg-blue-100 text-blue-600"
            />
            <StatCard
              title="予定実習"
              value={upcomingSessions}
              icon={BookOpen}
              description="今後の実習セッション"
              colorClass="bg-green-100 text-green-600"
            />
            <StatCard
              title="募集中イベント"
              value={upcomingEvents}
              icon={Calendar}
              description="参加申込受付中"
              colorClass="bg-purple-100 text-purple-600"
            />
            <StatCard
              title="全体出席率"
              value={`${overallAttendanceRate}%`}
              icon={TrendingUp}
              description="直近の実習"
              colorClass="bg-orange-100 text-orange-600"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* 今日の予定 */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>今日の予定</CardTitle>
                <CardDescription>{formatDate(today)}</CardDescription>
              </CardHeader>
              <CardContent>
                {todaySessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle className="h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">今日の予定はありません</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todaySessions.map((session) => (
                      <div key={session.id} className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{session.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {session.startTime} - {session.endTime} / {session.location}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">講師: {session.instructor}</p>
                        </div>
                        <Badge variant={session.status === "予定" ? "default" : "secondary"}>{session.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 最近の実習 */}
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>最近の実習</CardTitle>
                    <CardDescription>実施済みセッション</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/trainings">すべて見る</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{session.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(session.date)} / {session.instructor}
                        </p>
                      </div>
                      <Badge variant="outline">完了</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 注意が必要な生徒 */}
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <CardTitle>フォローアップが必要な生徒</CardTitle>
              </div>
              <CardDescription>出席率や成績に注意が必要な生徒</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentsNeedingAttention.map(({ student, attendanceRate }) => (
                  <div key={student.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.studentNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">出席率: {attendanceRate}%</p>
                        <p className="text-xs text-muted-foreground">{student.status}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/students/${student.id}`}>詳細</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
