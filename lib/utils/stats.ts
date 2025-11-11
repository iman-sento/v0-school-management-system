import type { AttendanceRecord, Student } from "../types"

export function calculateAttendanceRate(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0
  const attended = records.filter((r) => r.status === "出席" || r.status === "遅刻").length
  return Math.round((attended / records.length) * 100)
}

export function calculateAverageProficiency(records: AttendanceRecord[]): number {
  const withProficiency = records.filter((r) => r.proficiencyLevel !== undefined)
  if (withProficiency.length === 0) return 0
  const sum = withProficiency.reduce((acc, r) => acc + (r.proficiencyLevel || 0), 0)
  return Math.round((sum / withProficiency.length) * 10) / 10
}

export function getAttendanceStatusColor(status: AttendanceRecord["status"]): string {
  const colors = {
    出席: "bg-green-100 text-green-800",
    欠席: "bg-red-100 text-red-800",
    遅刻: "bg-yellow-100 text-yellow-800",
    早退: "bg-orange-100 text-orange-800",
    公欠: "bg-blue-100 text-blue-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

export function getStatusColor(status: Student["status"]): string {
  const colors = {
    在籍: "bg-green-100 text-green-800",
    休学: "bg-yellow-100 text-yellow-800",
    退学: "bg-red-100 text-red-800",
    卒業: "bg-blue-100 text-blue-800",
  }
  return colors[status]
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function formatTime(timeString: string): string {
  return timeString
}
