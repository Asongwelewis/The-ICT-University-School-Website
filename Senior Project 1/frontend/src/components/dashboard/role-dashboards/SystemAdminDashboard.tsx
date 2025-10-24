'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Users, CheckCircle, Clock, Shield, Settings, BarChart3 } from 'lucide-react'

export function SystemAdminDashboard() {
  return (
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
}