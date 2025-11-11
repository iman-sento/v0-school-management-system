import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/lib/db"
import {
  getStatusColor,
  getAttendanceStatusColor,
  calculateAttendanceRate,
  calculateAverageProficiency,
  formatDate,
} from "@/lib/utils/stats"
import { User, Mail, Phone, MapPin, Calendar, UserCircle, BookOpen, Award } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const student = await db.students.getById(id)

  if (!student) {
    notFound()
  }

  // 出席記録
  const attendanceRecords = await db.attendanceRecords.getByStudentId(id)
  const attendanceRate = calculateAttendanceRate(attendanceRecords)
  const avgProficiency = calculateAverageProficiency(attendanceRecords)

  // 受講中の実習セッション情報を取得
  const attendanceWithSessions = await Promise.all(
    attendanceRecords.map(async (record) => {
      const session = await db.trainingSessions.getById(record.sessionId)
      const course = session ? await db.trainingCourses.getById(session.courseId) : null
      return { ...record, session, course }
    }),
  )

  // イベント参加履歴
  const eventParticipations = await db.eventParticipations.getByStudentId(id)
  const eventParticipationsWithEvents = await Promise.all(
    eventParticipations.map(async (participation) => {
      const event = await db.events.getById(participation.eventId)
      return { ...participation, event }
    }),
  )

  // 成績
  const grades = await db.gradeRecords.getByStudentId(id)
  const gradesWithCourses = await Promise.all(
    grades.map(async (grade) => {
      const course = await db.trainingCourses.getById(grade.courseId)
      return { ...grade, course }
    }),
  )

  return (
    <div className="flex min-h-screen bg-[#008268]">
      <Sidebar />

      <main className="ml-64 flex-1 bg-white p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" asChild className="mb-4">
                <Link href="/students">← 生徒一覧に戻る</Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">生徒詳細</h1>
            </div>
            <Button>編集</Button>
          </div>

          {/* 基本情報カード */}
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl || "/placeholder.svg"}
                    alt={student.name}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{student.name}</h2>
                    <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                  </div>
                  <p className="text-muted-foreground">{student.furigana}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">生徒番号:</span>
                      <span className="font-medium">{student.studentNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{student.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">生年月日:</span>
                      <span>{formatDate(student.dateOfBirth)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">入学日:</span>
                      <span>{formatDate(student.enrollmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">〒{student.postalCode}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{student.address}</p>
                </div>
                <div className="text-right">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">出席率</p>
                      <p className="text-3xl font-bold text-[#008268]">{attendanceRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">平均習熟度</p>
                      <p className="text-3xl font-bold text-[#008268]">{avgProficiency}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* タブコンテンツ */}
          <Tabs defaultValue="attendance" className="space-y-6">
            <TabsList>
              <TabsTrigger value="attendance">
                <BookOpen className="mr-2 h-4 w-4" />
                受講履歴
              </TabsTrigger>
              <TabsTrigger value="grades">
                <Award className="mr-2 h-4 w-4" />
                成績
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="mr-2 h-4 w-4" />
                イベント
              </TabsTrigger>
              <TabsTrigger value="guardian">
                <UserCircle className="mr-2 h-4 w-4" />
                保護者情報
              </TabsTrigger>
            </TabsList>

            {/* 受講履歴 */}
            <TabsContent value="attendance" className="space-y-4">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>受講履歴</CardTitle>
                  <CardDescription>全{attendanceRecords.length}回の実習に参加</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attendanceWithSessions.map(({ session, course, ...record }) => (
                      <div key={record.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{course?.name || "実習名不明"}</p>
                              <Badge className={getAttendanceStatusColor(record.status)}>{record.status}</Badge>
                              {record.proficiencyLevel && (
                                <Badge variant="outline">習熟度: {record.proficiencyLevel}/5</Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {session ? formatDate(session.date) : "日付不明"} /{session?.instructor || "講師不明"} /
                              {session?.location || "場所不明"}
                            </p>
                            {record.feedback && (
                              <div className="mt-2 rounded-md bg-muted/50 p-3">
                                <p className="text-sm font-medium">フィードバック</p>
                                <p className="mt-1 text-sm text-muted-foreground">{record.feedback}</p>
                              </div>
                            )}
                            {record.notes && <p className="mt-2 text-xs text-muted-foreground">備考: {record.notes}</p>}
                          </div>
                          {record.checkInTime && (
                            <div className="text-right text-sm text-muted-foreground">
                              <p>入室: {record.checkInTime}</p>
                              {record.checkOutTime && <p>退室: {record.checkOutTime}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 成績 */}
            <TabsContent value="grades" className="space-y-4">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>成績一覧</CardTitle>
                  <CardDescription>科目別の成績評価</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gradesWithCourses.map(({ course, ...grade }) => (
                      <div key={grade.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{course?.name || "科目名不明"}</p>
                              <Badge
                                variant={
                                  grade.overallGrade === "A"
                                    ? "default"
                                    : grade.overallGrade === "B"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {grade.overallGrade}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{grade.semester}</p>
                            <div className="mt-3 grid gap-3 md:grid-cols-3">
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
                            </div>
                            {grade.comments && (
                              <div className="mt-3 rounded-md bg-muted/50 p-3">
                                <p className="text-sm font-medium">講評</p>
                                <p className="mt-1 text-sm text-muted-foreground">{grade.comments}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* イベント */}
            <TabsContent value="events" className="space-y-4">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>イベント参加履歴</CardTitle>
                  <CardDescription>修学旅行・特別講義など</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {eventParticipationsWithEvents.map(({ event, ...participation }) => (
                      <div key={participation.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{event?.name || "イベント名不明"}</p>
                              <Badge variant="outline">{event?.type}</Badge>
                              <Badge
                                className={
                                  participation.status === "参加済み"
                                    ? "bg-green-100 text-green-800"
                                    : participation.status === "承認"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                }
                              >
                                {participation.status}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {event ? formatDate(event.date) : "日付不明"} / {event?.location}
                            </p>
                            <div className="mt-3 flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">同意書:</span>
                                <Badge variant={participation.consentReceived ? "default" : "secondary"}>
                                  {participation.consentReceived ? "受領済み" : "未受領"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">支払い:</span>
                                <Badge variant={participation.paymentStatus === "支払済み" ? "default" : "secondary"}>
                                  {participation.paymentStatus}
                                </Badge>
                              </div>
                              {event?.fee && (
                                <span className="text-muted-foreground">参加費: ¥{event.fee.toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 保護者情報 */}
            <TabsContent value="guardian" className="space-y-4">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>保護者情報</CardTitle>
                  <CardDescription>緊急連絡先</CardDescription>
                </CardHeader>
                <CardContent>
                  {student.guardianName ? (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">氏名</p>
                          <p className="mt-1 text-lg">{student.guardianName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">続柄</p>
                          <p className="mt-1 text-lg">-</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">電話番号</p>
                          <p className="mt-1 text-lg">{student.guardianPhone || "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">メールアドレス</p>
                          <p className="mt-1 text-lg">{student.guardianEmail || "-"}</p>
                        </div>
                      </div>
                      {student.notes && (
                        <div className="rounded-lg bg-muted/50 p-4">
                          <p className="text-sm font-medium">備考</p>
                          <p className="mt-2 text-sm text-muted-foreground">{student.notes}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">保護者情報が登録されていません</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
