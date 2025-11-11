// 生徒情報
export interface Student {
  id: string
  studentNumber: string // 生徒番号
  name: string
  furigana: string
  dateOfBirth: string
  gender: "男性" | "女性" | "その他"
  email: string
  phone: string
  postalCode: string
  address: string
  enrollmentDate: string
  status: "在籍" | "休学" | "退学" | "卒業"
  guardianName?: string
  guardianPhone?: string
  guardianEmail?: string
  notes?: string
  photoUrl?: string
}

// 実習科目
export interface TrainingCourse {
  id: string
  code: string // 科目コード
  name: string
  description: string
  category: "飼育実習" | "水質管理" | "動物看護" | "その他"
  targetGrade: number
  maxCapacity: number
  duration: number // 時間数
  isActive: boolean
}

// 実習セッション（個別の実習実施）
export interface TrainingSession {
  id: string
  courseId: string
  sessionNumber: number
  date: string
  startTime: string
  endTime: string
  instructor: string
  location: string
  description?: string
  status: "予定" | "実施中" | "完了" | "キャンセル"
  maxParticipants: number
}

// 出席記録
export interface AttendanceRecord {
  id: string
  sessionId: string
  studentId: string
  status: "出席" | "欠席" | "遅刻" | "早退" | "公欠"
  checkInTime?: string
  checkOutTime?: string
  proficiencyLevel?: 1 | 2 | 3 | 4 | 5 // 習熟度 1-5
  feedback?: string
  notes?: string
}

// イベント
export interface Event {
  id: string
  name: string
  type: "修学旅行" | "校外学習" | "特別講義" | "その他"
  date: string
  endDate?: string
  location: string
  description: string
  fee?: number
  requiresConsent: boolean
  requiresPayment: boolean
  capacity: number
  status: "募集中" | "締切" | "実施済み" | "キャンセル"
}

// イベント参加
export interface EventParticipation {
  id: string
  eventId: string
  studentId: string
  applicationDate: string
  status: "申込" | "承認" | "キャンセル" | "参加済み"
  consentReceived: boolean
  paymentStatus: "未払い" | "支払済み" | "免除"
  notes?: string
}

// 評価記録
export interface GradeRecord {
  id: string
  studentId: string
  courseId: string
  semester: string
  midtermScore?: number
  finalScore?: number
  overallGrade: "A" | "B" | "C" | "D" | "F" | "未評価"
  attendance: number // 出席率
  comments?: string
}
