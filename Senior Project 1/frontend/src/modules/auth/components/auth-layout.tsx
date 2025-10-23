'use client'

import { ReactNode } from 'react'
import { GraduationCap, BookOpen, Users, Award } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-orange-500 to-orange-600 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
            <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rounded-lg rotate-45"></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-40 right-10 w-12 h-12 border-2 border-white rounded-lg rotate-12"></div>
          </div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            {/* Logo */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">ICT University</h1>
                  <p className="text-orange-100 text-sm">School Management System</p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold leading-tight">
                Streamline Your Educational Experience
              </h2>
              <p className="text-orange-100 text-lg">
                Access courses, grades, schedules, and more in one unified platform designed for modern education.
              </p>
              
              <div className="space-y-4 mt-8">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="text-orange-100">Course Management & Learning Resources</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="text-orange-100">Student & Faculty Collaboration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Award className="h-5 w-5" />
                  </div>
                  <span className="text-orange-100">Grade Tracking & Academic Progress</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">5000+</div>
                <div className="text-orange-200 text-sm">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">200+</div>
                <div className="text-orange-200 text-sm">Faculty</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-orange-200 text-sm">Programs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="bg-orange-500 p-3 rounded-xl">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-gray-800">ICT University</h1>
                  <p className="text-gray-600 text-sm">School Management System</p>
                </div>
              </div>
            </div>
            
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}