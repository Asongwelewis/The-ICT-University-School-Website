// Shared type definitions
export type UserRole = 'admin' | 'student' | 'staff'

export interface User {
  id: string
  email: string
  role: UserRole
  profile: UserProfile
  permissions: string[]
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  dateOfBirth?: Date
  address?: Address
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Course {
  id: string
  name: string
  code: string
  description: string
  credits: number
  instructorId: string
  schedule: CourseSchedule[]
  enrolledStudents: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CourseSchedule {
  day: string
  startTime: string
  endTime: string
  room: string
}

export interface Grade {
  id: string
  studentId: string
  courseId: string
  assessmentType: 'quiz' | 'exam' | 'assignment' | 'project'
  score: number
  maxScore: number
  grade: string
  feedback?: string
  recordedBy: string
  recordedAt: Date
}

export interface Invoice {
  id: string
  studentId: string
  amount: number
  currency: string
  dueDate: Date
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  items: InvoiceItem[]
  paymentHistory: Payment[]
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceItem {
  description: string
  amount: number
  quantity: number
}

export interface Payment {
  amount: number
  paymentDate: Date
  method: string
  transactionId: string
}

export interface Employee {
  id: string
  employeeId: string
  personalInfo: PersonalInfo
  jobDetails: JobDetails
  salary: SalaryInfo
  leaveBalance: LeaveBalance
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: Address
  emergencyContact: EmergencyContact
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface JobDetails {
  position: string
  department: string
  hireDate: Date
  employmentType: 'full-time' | 'part-time' | 'contract'
  reportingManager?: string
}

export interface SalaryInfo {
  baseSalary: number
  currency: string
  payFrequency: 'monthly' | 'bi-weekly' | 'weekly'
}

export interface LeaveBalance {
  annual: number
  sick: number
  personal: number
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    pagination?: PaginationInfo
    timestamp: string
    requestId: string
  }
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}