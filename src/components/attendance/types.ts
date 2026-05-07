export type HeaderLayout = 'centered' | 'split' | 'boxed-left'
export type WatermarkOption = '' | 'DRAFT' | 'CONFIDENTIAL' | 'SAMPLE'

export interface Student {
  id: string
  name: string
  fatherName: string
  extraData: Record<string, string>
}

/**
 * Controls which default columns are shown in the attendance sheet.
 * Each key maps to: { visible: boolean, label: string }
 * label lets the user rename the column header.
 */
export interface ColumnVisibility {
  serialNo: { visible: boolean; label: string }
  id: { visible: boolean; label: string }
  name: { visible: boolean; label: string }
  fatherName: { visible: boolean; label: string }
}

export const defaultColumnVisibility: ColumnVisibility = {
  serialNo:   { visible: true, label: '#' },
  id:         { visible: true, label: 'ID' },
  name:       { visible: true, label: 'Student Name' },
  fatherName: { visible: true, label: "Father's Name" },
}

export interface AttendanceConfig {
  // Branding
  instituteName: string
  courseName: string
  batchName: string
  instructorName: string
  headerLayout: HeaderLayout
  columnVisibility: ColumnVisibility
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
  columnVisibility: defaultColumnVisibility,
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
