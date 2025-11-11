"use client"

import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils/stats"
import { Calendar, Clock, MapPin, User, Save, CheckCircle } from "lucide-react"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import type { TrainingSession, TrainingCourse, Student, AttendanceRecord } from "@/lib/types"

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [session, setSession] = useState<TrainingSession | null>(null)
  const [course, setCourse] = useState<TrainingCourse | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [editingRecords, setEditingRecords] = useState<Record<string, Partial<AttendanceRecord>>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadData() {
      const sessionData = await db.trainingSessions.getById(id)
      if (!sessionData) return

      setSession(sessionData)

      const courseData = await db.trainingCourses.getById(sessionData.courseId)
      setCourse(courseData || null)

      const studentsData = await db.students.getAll()
      setStudents(studentsData.filter((s) => s.status === "在籍"))

      const recordsData = await db.attendanceRecords.getBySessionId(id)
      setAttendanceRecords(recordsData)

      // 既存の記録を編集用に初期化
      const initial: Record<string, Partial<AttendanceRecord>> = {}
      recordsData.forEach((record) => {
        initial[record.studentId] = record
      })
      setEditingRecords(initial)
    }
    loadData()
  }, [id])

  const handleUpdateRecord = (studentId: string, field: string, value: any) => {
    setEditingRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    // 保存処理（実際のDBに保存する場合はここで実装）
    console.log("[v0] Saving attendance records:", editingRecords)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!session || !course) {
    return (
      <div className="flex min-h-screen bg-muted/30">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" asChild className="mb-4">
                <Link href="/trainings">← 実習一覧に戻る</Link>
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">実習セッション詳細</h1>
            </div>
            <Button onClick={handleSave} size="lg">
              {saved ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  保存完了
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  保存
                </>
              )}
            </Button>
          </div>

          {/* セッション情報 */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>{course.name}</CardTitle>
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
                  <CardDescription className="mt-2">{session.description || "説明なし"}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">実施日</p>
                    <p className="font-medium">{formatDate(session.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">時間</p>
                    <p className="font-medium">
                      {session.startTime} - {session.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">場所</p>
                    <p className="font-medium">{session.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">講師</p>
                    <p className="font-medium">{session.instructor}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 出席管理・習熟度入力 */}
          <Card>
            <CardHeader>
              <CardTitle>出席管理・習熟度記録</CardTitle>
              <CardDescription>
                参加者: {attendanceRecords.length} / {session.maxParticipants}名
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => {
                  const record = editingRecords[student.id]
                  const hasRecord = attendanceRecords.some((r) => r.studentId === student.id)

                  return (
                    <div key={student.id} className="rounded-lg border p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-4">
                          <div>
                            <p className="font-semibold">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.studentNumber}</p>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {/* 出欠状況 */}
                            <div className="space-y-2">
                              <Label>出欠状況</Label>
                              <Select
                                value={record?.status || "出席"}
                                onValueChange={(value) => handleUpdateRecord(student.id, "status", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="出席">出席</SelectItem>
                                  <SelectItem value="欠席">欠席</SelectItem>
                                  <SelectItem value="遅刻">遅刻</SelectItem>
                                  <SelectItem value="早退">早退</SelectItem>
                                  <SelectItem value="公欠">公欠</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* 入室時刻 */}
                            <div className="space-y-2">
                              <Label>入室時刻</Label>
                              <Input
                                type="time"
                                value={record?.checkInTime || ""}
                                onChange={(e) => handleUpdateRecord(student.id, "checkInTime", e.target.value)}
                              />
                            </div>

                            {/* 退室時刻 */}
                            <div className="space-y-2">
                              <Label>退室時刻</Label>
                              <Input
                                type="time"
                                value={record?.checkOutTime || ""}
                                onChange={(e) => handleUpdateRecord(student.id, "checkOutTime", e.target.value)}
                              />
                            </div>

                            {/* 習熟度 */}
                            <div className="space-y-2">
                              <Label>習熟度 (1-5)</Label>
                              <Select
                                value={record?.proficiencyLevel?.toString() || ""}
                                onValueChange={(value) =>
                                  handleUpdateRecord(student.id, "proficiencyLevel", Number.parseInt(value))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="選択" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1 - 要改善</SelectItem>
                                  <SelectItem value="2">2 - やや不足</SelectItem>
                                  <SelectItem value="3">3 - 普通</SelectItem>
                                  <SelectItem value="4">4 - 良好</SelectItem>
                                  <SelectItem value="5">5 - 優秀</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* フィードバック */}
                          <div className="space-y-2">
                            <Label>フィードバック</Label>
                            <Textarea
                              placeholder="実習での様子やコメントを記入..."
                              value={record?.feedback || ""}
                              onChange={(e) => handleUpdateRecord(student.id, "feedback", e.target.value)}
                              rows={2}
                            />
                          </div>

                          {/* 備考 */}
                          <div className="space-y-2">
                            <Label>備考</Label>
                            <Input
                              placeholder="特記事項があれば記入..."
                              value={record?.notes || ""}
                              onChange={(e) => handleUpdateRecord(student.id, "notes", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
