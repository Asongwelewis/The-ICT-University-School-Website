'use client'

import React from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BookOpen, 
  Users, 
  Calendar, 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Clock,
  Target,
  BarChart3,
  FileText,
  Settings,
  Shield,
  Bell,
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
  LineChart
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  const renderSystemAdminDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
        <h1 className="text-orange-700 dark:text-orange-300">System Administration Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive system management and oversight</p>
      </div>

      {/* System Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">1,247</div>
            <p className="text-xs text-muted-foreground">+12 new this week</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">98.5%</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">342</div>
            <p className="text-xs text-muted-foreground">Current active users</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Action Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Manage system users and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Users</span>
                <span>1,247</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white">
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Settings className="h-5 w-5" />
              System Configuration
            </CardTitle>
            <CardDescription>Configure system settings and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Configuration Status</span>
                <span>Optimal</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <Button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white">
              Configure System
            </Button>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <BarChart3 className="h-5 w-5" />
              System Reports
            </CardTitle>
            <CardDescription>Generate comprehensive system reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Reports Generated</span>
                <span>156</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
            <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white">
              Generate Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderAcademicStaffDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
        <h1 className="text-orange-700 dark:text-orange-300">Academic Staff Dashboard</h1>
        <p className="text-muted-foreground">Manage your courses, students, and academic activities</p>
      </div>

      {/* Academic Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">8</div>
            <p className="text-xs text-muted-foreground">Active this semester</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">234</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
            <Award className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">15</div>
            <p className="text-xs text-muted-foreground">Assignments to grade</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</div>
            <p className="text-xs text-muted-foreground">Next 2 weeks</p>
          </CardContent>
        </Card>
      </div>

      {/* Academic Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <BookOpen className="h-5 w-5" />
              Course Management
            </CardTitle>
            <CardDescription>Manage your course content and materials</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <BarChart3 className="h-5 w-5" />
              Student Performance
            </CardTitle>
            <CardDescription>Track and analyze student progress</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Award className="h-5 w-5" />
              Grade Management
            </CardTitle>
            <CardDescription>Enter and manage student grades</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
        <h1 className="text-orange-700 dark:text-orange-300">Student Portal</h1>
        <p className="text-muted-foreground">Access your academic information and services</p>
      </div>

      {/* Student Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <Award className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">3.85</div>
            <p className="text-xs text-muted-foreground">Out of 4.0</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">6</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">94%</div>
            <p className="text-xs text-muted-foreground">Overall rate</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">$0</div>
            <p className="text-xs text-muted-foreground">All paid up</p>
          </CardContent>
        </Card>
      </div>

      {/* Student Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <BookOpen className="h-5 w-5" />
              My Courses
            </CardTitle>
            <CardDescription>Access course materials and content</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Award className="h-5 w-5" />
              My Grades
            </CardTitle>
            <CardDescription>View your academic performance</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <DollarSign className="h-5 w-5" />
              Fee Payments
            </CardTitle>
            <CardDescription>Manage your tuition and fees</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )

  const renderHRDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
        <h1 className="text-orange-700 dark:text-orange-300">HR Management Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive human resource management and operations</p>
      </div>

      {/* HR Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">156</div>
            <p className="text-xs text-muted-foreground">+5 new hires</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leave</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
            <p className="text-xs text-muted-foreground">Requests to review</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll Ready</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">98%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Reviews</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">8</div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>
      </div>

      {/* HR Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Users className="h-5 w-5" />
              Employee Management
            </CardTitle>
            <CardDescription>Manage employee records and information</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <DollarSign className="h-5 w-5" />
              Payroll Processing
            </CardTitle>
            <CardDescription>Process salaries and benefits</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Calendar className="h-5 w-5" />
              Leave Management
            </CardTitle>
            <CardDescription>Track and approve leave requests</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )

  const renderFinanceDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
        <h1 className="text-orange-700 dark:text-orange-300">Finance Management Dashboard</h1>
        <p className="text-muted-foreground">Financial operations, reporting, and budget management</p>
      </div>

      {/* Finance Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">$125K</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">23</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">73%</div>
            <p className="text-xs text-muted-foreground">Current fiscal year</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">28.8%</div>
            <p className="text-xs text-muted-foreground">Above target</p>
          </CardContent>
        </Card>
      </div>

      {/* Finance Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <FileText className="h-5 w-5" />
              Invoice Management
            </CardTitle>
            <CardDescription>Create and manage student invoices</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <BarChart3 className="h-5 w-5" />
              Expense Tracking
            </CardTitle>
            <CardDescription>Monitor and categorize expenses</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <LineChart className="h-5 w-5" />
              Financial Reports
            </CardTitle>
            <CardDescription>Generate comprehensive financial reports</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )

  const renderMarketingDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
        <h1 className="text-orange-700 dark:text-orange-300">Marketing Team Dashboard</h1>
        <p className="text-muted-foreground">Campaign management, lead tracking, and performance analytics</p>
      </div>

      {/* Marketing Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">12</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">347</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">12.5%</div>
            <p className="text-xs text-muted-foreground">+2.1% improvement</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">3.2x</div>
            <p className="text-xs text-muted-foreground">Return on investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Marketing Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Target className="h-5 w-5" />
              Campaign Management
            </CardTitle>
            <CardDescription>Create and manage marketing campaigns</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <BarChart3 className="h-5 w-5" />
              Analytics Dashboard
            </CardTitle>
            <CardDescription>View campaign performance and ROI</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Calendar className="h-5 w-5" />
              Event Management
            </CardTitle>
            <CardDescription>Plan and manage marketing events</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case 'system_admin':
        return renderSystemAdminDashboard()
      case 'academic_staff':
        return renderAcademicStaffDashboard()
      case 'student':
        return renderStudentDashboard()
      case 'hr_personnel':
        return renderHRDashboard()
      case 'finance_staff':
        return renderFinanceDashboard()
      case 'marketing_team':
        return renderMarketingDashboard()
      default:
        return renderStudentDashboard()
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold">ICT University</h1>
                <p className="text-orange-100">School Management System</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-orange-100 block">
                    Welcome, {user?.full_name || user?.email}
                  </span>
                  <Badge variant="secondary" size="sm" className="mt-1 bg-white/20 text-white border-white/30">
                    {user?.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderDashboardByRole()}
        </main>
      </div>
    </ProtectedRoute>
  )
}