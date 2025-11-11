"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

type CourseAttendanceDatum = { name: string; 出席率: number }
type MonthlySessionDatum = { month: string; セッション数: number }
type GradeDistributionDatum = { 評価: string; 人数: number }

export function ReportsCharts({
  courseAttendanceData,
  monthlySessionData,
  gradeDistributionData,
}: {
  courseAttendanceData: CourseAttendanceDatum[]
  monthlySessionData: MonthlySessionDatum[]
  gradeDistributionData: GradeDistributionDatum[]
}) {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-white">
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

        <Card className="bg-white">
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

      <Card className="bg-white">
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
    </>
  )
}

