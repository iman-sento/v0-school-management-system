import {
  mockStudents,
  mockTrainingCourses,
  mockTrainingSessions,
  mockAttendanceRecords,
  mockEvents,
  mockEventParticipations,
  mockGradeRecords,
} from "./mock-data"
import type {
  Student,
  TrainingCourse,
  TrainingSession,
  AttendanceRecord,
  Event,
  EventParticipation,
  GradeRecord,
} from "./types"

// モックデータベース（将来的にSupabaseなどに置き換え可能）
export const db = {
  students: {
    getAll: async (): Promise<Student[]> => {
      return [...mockStudents]
    },
    getById: async (id: string): Promise<Student | undefined> => {
      return mockStudents.find((s) => s.id === id)
    },
    create: async (student: Omit<Student, "id">): Promise<Student> => {
      const newStudent = { ...student, id: `s${Date.now()}` }
      mockStudents.push(newStudent)
      return newStudent
    },
    update: async (id: string, updates: Partial<Student>): Promise<Student | undefined> => {
      const index = mockStudents.findIndex((s) => s.id === id)
      if (index !== -1) {
        mockStudents[index] = { ...mockStudents[index], ...updates }
        return mockStudents[index]
      }
      return undefined
    },
  },
  trainingCourses: {
    getAll: async (): Promise<TrainingCourse[]> => {
      return [...mockTrainingCourses]
    },
    getById: async (id: string): Promise<TrainingCourse | undefined> => {
      return mockTrainingCourses.find((c) => c.id === id)
    },
  },
  trainingSessions: {
    getAll: async (): Promise<TrainingSession[]> => {
      return [...mockTrainingSessions]
    },
    getById: async (id: string): Promise<TrainingSession | undefined> => {
      return mockTrainingSessions.find((s) => s.id === id)
    },
    getByCourseId: async (courseId: string): Promise<TrainingSession[]> => {
      return mockTrainingSessions.filter((s) => s.courseId === courseId)
    },
    create: async (session: Omit<TrainingSession, "id">): Promise<TrainingSession> => {
      const newSession = { ...session, id: `ts${Date.now()}` }
      mockTrainingSessions.push(newSession)
      return newSession
    },
  },
  attendanceRecords: {
    getAll: async (): Promise<AttendanceRecord[]> => {
      return [...mockAttendanceRecords]
    },
    getBySessionId: async (sessionId: string): Promise<AttendanceRecord[]> => {
      return mockAttendanceRecords.filter((a) => a.sessionId === sessionId)
    },
    getByStudentId: async (studentId: string): Promise<AttendanceRecord[]> => {
      return mockAttendanceRecords.filter((a) => a.studentId === studentId)
    },
    create: async (record: Omit<AttendanceRecord, "id">): Promise<AttendanceRecord> => {
      const newRecord = { ...record, id: `ar${Date.now()}` }
      mockAttendanceRecords.push(newRecord)
      return newRecord
    },
    update: async (id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined> => {
      const index = mockAttendanceRecords.findIndex((a) => a.id === id)
      if (index !== -1) {
        mockAttendanceRecords[index] = { ...mockAttendanceRecords[index], ...updates }
        return mockAttendanceRecords[index]
      }
      return undefined
    },
  },
  events: {
    getAll: async (): Promise<Event[]> => {
      return [...mockEvents]
    },
    getById: async (id: string): Promise<Event | undefined> => {
      return mockEvents.find((e) => e.id === id)
    },
  },
  eventParticipations: {
    getAll: async (): Promise<EventParticipation[]> => {
      return [...mockEventParticipations]
    },
    getByEventId: async (eventId: string): Promise<EventParticipation[]> => {
      return mockEventParticipations.filter((p) => p.eventId === eventId)
    },
    getByStudentId: async (studentId: string): Promise<EventParticipation[]> => {
      return mockEventParticipations.filter((p) => p.studentId === studentId)
    },
  },
  gradeRecords: {
    getAll: async (): Promise<GradeRecord[]> => {
      return [...mockGradeRecords]
    },
    getByStudentId: async (studentId: string): Promise<GradeRecord[]> => {
      return mockGradeRecords.filter((g) => g.studentId === studentId)
    },
  },
}
