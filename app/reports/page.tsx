import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { calculateAttendanceRate } from "@/lib/utils/stats"
import { BarChart3, Download, FileText, TrendingUp, Users, BookOpen } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export default async function ReportsPage() {
  const [students, attendanceRecords, courses, sessions, grades] = await Promise.all([
    db.students.getAll(),
    db.attendanceRecords.getAll(),
    db.trainingCourses.getAll(),
    db.trainingSessions.getAll(),
    db.gradeRecords.getAll(),
  ])

  // 科目別出席率
  const courseAttendanceData = await Promise.all(
    courses.slice(0, 4).map(async (course) => {
      const courseSessions = sessions.filter((s) => s.courseId === course.id)
      const sessionIds = courseSessions.map((s) => s.id)
      const courseRecords = attendanceRecords.filter((r) => sessionIds.includes(r.sessionId))
      const rate = calculateAttendanceRate(courseRecords)
      return {
        name: course.name.length > 10 ? course.name.substring(0, 10) + "..." : course.name,
        出席率: rate,
      }
    }),
  )

  // 月別セッション数
  const monthlySessionData = [
    { month: "10月", セッション数: 8 },
    { month: "11月", セッション数: 12 },
    { month: "12月", セッション数: 10 },
    { month: "1月", セッション数: 15 },
  ]

  // 成績分布
  const gradeDistributionData = [
    { 評価: "A", 人数: grades.filter((g) => g.overallGrade === "A").length },
    { 評価: "B", 人数: grades.filter((g) => g.overallGrade === "B").length },
    { 評価: "C", 人数: grades.filter((g) => g.overallGrade === "C").length },
    { 評価: "D", 人数: grades.filter((g) => g.overallGrade === "D").length },
    { 評価: "F", 人数: grades.filter((g) => g.overallGrade === "F").length },
  ]

  const overallAttendanceRate = calculateAttendanceRate(attendanceRecords)
  const activeStudents = students.filter((s) => s.status === "在籍").length
  const completedSessions = sessions.filter((s) => s.status === "完了").length

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">在籍生徒</p>
                    <p className="text-2xl font-bold">{activeStudents}名</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">完了実習</p>
                    <p className="text-2xl font-bold">{completedSessions}回</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">全体出席率</p>
                    <p className="text-2xl font-bold">{overallAttendanceRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">評価記録</p>
                    <p className="text-2xl font-bold">{grades.length}件</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* グラフ */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 科目別出席率 */}
            <Card>
              <CardHeader>
                <CardTitle>科目別出席率</CardTitle>
                <CardDescription>各実習科目の出席状況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={courseAttendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="出席率" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* 月別セッション数 */}
            <Card>
              <CardHeader>
                <CardTitle>月別実習セッション数</CardTitle>
                <CardDescription>実習の実施状況推移</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlySessionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="セッション数" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 成績分布 */}
          <Card>
            <CardHeader>
              <CardTitle>成績評価分布</CardTitle>
              <CardDescription>全体の成績状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="評価" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="人数" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* クイックレポート */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold">月次レポート</p>
                    <p className="text-sm text-muted-foreground">今月の活動まとめ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-semibold">生徒別レポート</p>
                    <p className="text-sm text-muted-foreground">個別の学習状況</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-primary" />
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
