import { RegisterForm } from '@/modules/auth/components/register-form'
import { AuthLayout } from '@/components/auth/auth-layout'

export default function RegisterPage() {
  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join ICT University's digital ecosystem"
    >
      <RegisterForm />
    </AuthLayout>
  )
}