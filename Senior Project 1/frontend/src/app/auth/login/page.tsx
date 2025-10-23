import { LoginForm } from '@/modules/auth/components/login-form'
import { AuthLayout } from '@/modules/auth/components/auth-layout'

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}