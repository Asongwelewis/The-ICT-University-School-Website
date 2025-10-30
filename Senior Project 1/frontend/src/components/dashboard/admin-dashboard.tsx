'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Users, CheckCircle, Clock, Shield, Settings, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-6 rounded-lg border border-orange-200">
        <h1 className="text-2xl font-bold text-orange-700">System Administration Dashboard</h1>
        <p className="text-gray-600">Comprehensive system management and oversight</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">1,247</div>
            <p className="text-xs text-gray-500">+12 new this week</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">98.5%</div>
            <p className="text-xs text-gray-500">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">342</div>
            <p className="text-xs text-gray-500">Current active users</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">2</div>
            <p className="text-xs text-gray-500">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-orange-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
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

        <Card className="border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
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

        <Card className="border-orange-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
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
}