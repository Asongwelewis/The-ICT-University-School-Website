import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  
  await supabase.auth.signOut()
  
  return NextResponse.redirect(new URL('/auth/login', request.url))
}