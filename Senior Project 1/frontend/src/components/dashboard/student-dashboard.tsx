'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Award, CheckCircle, DollarSign } from 'lucide-react'
import Link from 'next/link'

export function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-6 rounded-lg border border-orange-200">
        <h1 className="text-2xl font-bold text-orange-700">Student Portal</h1>
        <p className="text-gray-600">Access your academic information and services</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <Award className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3.85</div>
            <p className="text-xs text-gray-500">Out of 4.0</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">6</div>
            <p className="text-xs text-gray-500">This semester</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">94%</div>
            <p className="text-xs text-gray-500">Overall rate</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">$0</div>
            <p className="text-xs text-gray-500">All paid up</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/courses">
          <Card className="border-orange-200 hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <BookOpen className="h-5 w-5" />
                My Courses
              </CardTitle>
              <CardDescription>Access course materials and content</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/grades">
          <Card className="border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Award className="h-5 w-5" />
                My Grades
              </CardTitle>
              <CardDescription>View your academic performance</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/payments">
          <Card className="border-orange-200 hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <DollarSign className="h-5 w-5" />
                Fee Payments
              </CardTitle>
              <CardDescription>Manage your tuition and fees</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}