import { RegisterForm } from '@/modules/auth/components/register-form'
import { AuthLayout } from '@/modules/auth/components/auth-layout'

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}