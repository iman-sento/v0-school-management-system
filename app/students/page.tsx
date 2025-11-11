import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { db } from "@/lib/db"
import { getStatusColor, calculateAttendanceRate } from "@/lib/utils/stats"
import { Search, Plus, Mail, Phone, User } from "lucide-react"
import Link from "next/link"

export default async function StudentsPage() {
  const students = await db.students.getAll()

  // 各生徒の出席率を計算
  const studentsWithStats = await Promise.all(
    students.map(async (student) => {
      const attendanceRecords = await db.attendanceRecords.getByStudentId(student.id)
      const attendanceRate = calculateAttendanceRate(attendanceRecords)
      return { ...student, attendanceRate }
    }),
  )

  const statusCounts = {
    在籍: students.filter((s) => s.status === "在籍").length,
    休学: students.filter((s) => s.status === "休学").length,
    退学: students.filter((s) => s.status === "退学").length,
    卒業: students.filter((s) => s.status === "卒業").length,
  }

  return (
    <div className="flex min-h-screen bg-[#008268]">
      <Sidebar />

      <main className="ml-64 flex-1 bg-white p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">生徒管理</h1>
              <p className="mt-2 text-muted-foreground">生徒情報の管理と受講履歴の確認</p>
            </div>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              新規生徒登録
            </Button>
          </div>

          {/* 統計情報 */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">在籍</p>
                  <p className="mt-2 text-3xl font-bold text-[#008268]">{statusCounts["在籍"]}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">休学</p>
                  <p className="mt-2 text-3xl font-bold text-[#008268]">{statusCounts["休学"]}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">退学</p>
                  <p className="mt-2 text-3xl font-bold text-[#008268]">{statusCounts["退学"]}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">卒業</p>
                  <p className="mt-2 text-3xl font-bold text-[#008268]">{statusCounts["卒業"]}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 検索とフィルター */}
          <Card className="bg-white">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="生徒名、生徒番号で検索..." className="pl-9" />
                </div>
                <Button variant="outline">フィルター</Button>
              </div>
            </CardHeader>
          </Card>

          {/* 生徒一覧 */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>生徒一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentsWithStats.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      {student.photoUrl ? (
                        <img
                          src={student.photoUrl || "/placeholder.svg"}
                          alt={student.name}
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{student.name}</p>
                          <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {student.studentNumber} / {student.furigana}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {student.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">出席率</p>
                        <p className="text-2xl font-bold text-[#008268]">{student.attendanceRate}%</p>
                      </div>
                      <Button variant="outline" asChild>
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
