import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { Award } from "lucide-react"

export default async function GradesPage() {
  const [grades, students, courses] = await Promise.all([
    db.gradeRecords.getAll(),
    db.students.getAll(),
    db.trainingCourses.getAll(),
  ])

  const gradesWithDetails = await Promise.all(
    grades.map(async (grade) => {
      const student = await db.students.getById(grade.studentId)
      const course = await db.trainingCourses.getById(grade.courseId)
      return { ...grade, student, course }
    }),
  )

  // 成績分布
  const gradeDistribution = {
    A: grades.filter((g) => g.overallGrade === "A").length,
    B: grades.filter((g) => g.overallGrade === "B").length,
    C: grades.filter((g) => g.overallGrade === "C").length,
    D: grades.filter((g) => g.overallGrade === "D").length,
    F: grades.filter((g) => g.overallGrade === "F").length,
  }

  const avgAttendance = Math.round(grades.reduce((sum, g) => sum + g.attendance, 0) / grades.length)

  return (
    <div className="flex min-h-screen bg-[#008268]">
      <Sidebar />

      <main className="ml-64 flex-1 bg-white p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* ヘッダー */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">成績管理</h1>
            <p className="mt-2 text-muted-foreground">科目別の成績評価と学習状況</p>
          </div>

          {/* 統計情報 */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">総評価数</p>
                  <p className="mt-2 text-3xl font-bold text-[#008268]">{grades.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">A評価</p>
                  <p className="mt-2 text-3xl font-bold text-[#008268]">{gradeDistribution.A}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">平均出席率</p>
                  <p className="mt-2 text-3xl font-bold text-[#008268]">{avgAttendance}%</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">評価科目</p>
                  <p className="mt-2 text-3xl font-bold text-[#008268]">{courses.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 成績分布 */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>成績分布</CardTitle>
              <CardDescription>全体の評価割合</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                {Object.entries(gradeDistribution).map(([grade, count]) => (
                  <div key={grade} className="rounded-lg border p-4 text-center">
                    <p className="text-2xl font-bold">{grade}</p>
                    <p className="mt-2 text-3xl font-bold text-primary">{count}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{Math.round((count / grades.length) * 100)}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 成績一覧 */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>成績一覧</CardTitle>
              <CardDescription>科目別・生徒別の評価</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gradesWithDetails.map(({ student, course, ...grade }) => (
                  <div key={grade.id} className="flex items-start justify-between rounded-lg border p-4">
                    <div className="flex flex-1 gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{student?.name || "生徒名不明"}</p>
                          <span className="text-sm text-muted-foreground">-</span>
                          <p className="text-sm font-medium">{course?.name || "科目名不明"}</p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{grade.semester}</p>
                        <div className="mt-3 grid gap-3 md:grid-cols-4">
                          <div>
                            <p className="text-xs text-muted-foreground">中間試験</p>
                            <p className="text-lg font-semibold">{grade.midtermScore || "-"}点</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">期末試験</p>
                            <p className="text-lg font-semibold">{grade.finalScore || "-"}点</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">出席率</p>
                            <p className="text-lg font-semibold">{grade.attendance}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">総合評価</p>
                            <Badge
                              variant={
                                grade.overallGrade === "A"
                                  ? "default"
                                  : grade.overallGrade === "B"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-lg"
                            >
                              {grade.overallGrade}
                            </Badge>
                          </div>
                        </div>
                        {grade.comments && <p className="mt-3 text-sm text-muted-foreground">{grade.comments}</p>}
                      </div>
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
