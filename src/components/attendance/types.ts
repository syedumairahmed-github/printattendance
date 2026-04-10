export type HeaderLayout = 'centered' | 'split' | 'boxed-left'
export type WatermarkOption = '' | 'DRAFT' | 'CONFIDENTIAL' | 'SAMPLE'

export interface Student {
  id: string
  name: string
  fatherName: string
  extraData: Record<string, string>
}

export interface AttendanceConfig {
  // Branding
  instituteName: string
  courseName: string
  batchName: string
  instructorName: string
  headerLayout: HeaderLayout
  extraColumns: string[]
  // Timeline
  year: number
  month: number // 0-based
  holidays: number[] // 1-based day numbers
  // Students
  students: Student[]
  // Export
  watermark: WatermarkOption
  darkMode: boolean
}

export const defaultConfig: AttendanceConfig = {
  instituteName: '',
  courseName: '',
  batchName: '',
  instructorName: '',
  headerLayout: 'centered',
  extraColumns: [],
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  holidays: [],
  students: [],
  watermark: '',
  darkMode: false,
}

export interface ClassProfile {
  id: string
  name: string // e.g. "Grade 10 - Mathematics"
  config: AttendanceConfig
}

export interface WorkspaceState {
  activeProfileId: string
  profiles: ClassProfile[]
  darkMode: boolean
}
