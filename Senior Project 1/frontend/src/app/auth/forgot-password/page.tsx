import { ForgotPasswordForm } from '@/modules/auth/components/forgot-password-form'
import { AuthLayout } from '@/modules/auth/components/auth-layout'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}