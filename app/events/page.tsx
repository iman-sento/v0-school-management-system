import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { formatDate } from "@/lib/utils/stats"
import { Calendar, MapPin, Users, Plus, DollarSign } from "lucide-react"

export default async function EventsPage() {
  const [events, allParticipations] = await Promise.all([db.events.getAll(), db.eventParticipations.getAll()])

  const eventsWithStats = events.map((event) => {
    const participations = allParticipations.filter((p) => p.eventId === event.id)
    const paidCount = participations.filter((p) => p.paymentStatus === "支払済み").length
    const consentCount = participations.filter((p) => p.consentReceived).length
    return { ...event, participantCount: participations.length, paidCount, consentCount }
  })

  const activeEvents = eventsWithStats.filter((e) => e.status === "募集中")
  const completedEvents = eventsWithStats.filter((e) => e.status === "実施済み")

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* ヘッダー */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">イベント管理</h1>
              <p className="mt-2 text-muted-foreground">修学旅行、校外学習、特別講義の管理</p>
            </div>
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              新規イベント作成
            </Button>
          </div>

          {/* 統計情報 */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">募集中</p>
                  <p className="mt-2 text-3xl font-bold">{activeEvents.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">実施済み</p>
                  <p className="mt-2 text-3xl font-bold">{completedEvents.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">総申込数</p>
                  <p className="mt-2 text-3xl font-bold">{allParticipations.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* イベント一覧 */}
          <Card>
            <CardHeader>
              <CardTitle>イベント一覧</CardTitle>
              <CardDescription>全{events.length}件のイベント</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventsWithStats.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex flex-1 gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{event.name}</p>
                          <Badge variant="outline">{event.type}</Badge>
                          <Badge
                            variant={
                              event.status === "募集中"
                                ? "default"
                                : event.status === "実施済み"
                                  ? "outline"
                                  : event.status === "締切"
                                    ? "secondary"
                                    : "destructive"
                            }
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(event.date)}
                            {event.endDate && ` - ${formatDate(event.endDate)}`}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            定員: {event.capacity}名
                          </div>
                          {event.fee && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />¥{event.fee.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <span>参加申込: {event.participantCount}名</span>
                          {event.requiresConsent && <span>同意書受領: {event.consentCount}名</span>}
                          {event.requiresPayment && <span>支払完了: {event.paidCount}名</span>}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline">詳細</Button>
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
