import { LoginForm } from '@/modules/auth/components/login-form'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your ICT University account"
    >
      <LoginForm />
    </AuthLayout>
  )
}