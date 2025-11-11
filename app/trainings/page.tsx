import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils/stats"
import { BookOpen, Calendar, Clock, MapPin, Plus, User } from "lucide-react"
import Link from "next/link"

export default async function TrainingsPage() {
  const [courses, sessions] = await Promise.all([db.trainingCourses.getAll(), db.trainingSessions.getAll()])

  const activeCourses = courses.filter((c) => c.isActive)
  const upcomingSessions = sessions.filter((s) => s.status === "予定")
  const completedSessions = sessions.filter((s) => s.status === "完了")
  const ongoingSessions = sessions.filter((s) => s.status === "実施中")

  // 科目ごとにセッションをグループ化
  const sessionsWithCourses = await Promise.all(
    sessions.map(async (session) => {
      const course = await db.trainingCourses.getById(session.courseId)
      const attendanceCount = (await db.attendanceRecords.getBySessionId(session.id)).length
      return { ...session, course, attendanceCount }
    }),
  )

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">実習管理</h1>
              <p className="mt-2 text-muted-foreground">実習科目とセッションの管理</p>
            </div>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              新規セッション作成
            </Button>
          </div>

          {/* 統計情報 */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">開講科目</p>
                  <p className="mt-2 text-3xl font-bold">{activeCourses.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">予定実習</p>
                  <p className="mt-2 text-3xl font-bold">{upcomingSessions.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">実施中</p>
                  <p className="mt-2 text-3xl font-bold">{ongoingSessions.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">完了</p>
                  <p className="mt-2 text-3xl font-bold">{completedSessions.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* タブコンテンツ */}
          <Tabs defaultValue="sessions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="sessions">実習セッション</TabsTrigger>
              <TabsTrigger value="courses">実習科目</TabsTrigger>
            </TabsList>

            {/* 実習セッション */}
            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>実習セッション一覧</CardTitle>
                  <CardDescription>全{sessions.length}件の実習セッション</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessionsWithCourses
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((session) => (
                        <div
                          key={session.id}
                          className="flex items-start justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex flex-1 gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                              <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{session.course?.name || "科目名不明"}</p>
                                <Badge
                                  variant={
                                    session.status === "予定"
                                      ? "default"
                                      : session.status === "実施中"
                                        ? "secondary"
                                        : session.status === "完了"
                                          ? "outline"
                                          : "destructive"
                                  }
                                >
                                  {session.status}
                                </Badge>
                                <Badge variant="outline">第{session.sessionNumber}回</Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground">{session.description || "説明なし"}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(session.date)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {session.startTime} - {session.endTime}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {session.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {session.instructor}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">参加者</p>
                              <p className="text-2xl font-bold">
                                {session.attendanceCount}/{session.maxParticipants}
                              </p>
                            </div>
                            <Button variant="outline" asChild>
                              <Link href={`/trainings/sessions/${session.id}`}>詳細</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 実習科目 */}
            <TabsContent value="courses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>実習科目一覧</CardTitle>
                  <CardDescription>全{courses.length}科目</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {courses.map((course) => {
                      const courseSessions = sessions.filter((s) => s.courseId === course.id)
                      return (
                        <div key={course.id} className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{course.name}</p>
                                <Badge variant="outline">{course.code}</Badge>
                                <Badge
                                  className={
                                    course.category === "飼育実習"
                                      ? "bg-blue-100 text-blue-800"
                                      : course.category === "水質管理"
                                        ? "bg-green-100 text-green-800"
                                        : course.category === "動物看護"
                                          ? "bg-purple-100 text-purple-800"
                                          : "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {course.category}
                                </Badge>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">{course.description}</p>
                              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                <span>対象: {course.targetGrade}年生</span>
                                <span>定員: {course.maxCapacity}名</span>
                                <span>時間数: {course.duration}時間</span>
                              </div>
                              <div className="mt-3">
                                <p className="text-sm">
                                  実施済み: {courseSessions.filter((s) => s.status === "完了").length}回 / 予定:{" "}
                                  {courseSessions.filter((s) => s.status === "予定").length}回
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
