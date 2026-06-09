import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

import { AuthShell } from '@/components/auth/AuthShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authApi, extractError } from '@/services/api'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email }: FormData) => {
    try {
      await authApi.forgotPassword(email)
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  return (
    <AuthShell>
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
        {isSubmitSuccessful ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Check your inbox</h2>
            <p className="mt-2 text-sm text-gray-500">
              If an account exists for that email, we&apos;ve sent a reset link.
            </p>
            <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm text-brand font-medium">
              <ArrowLeft size={16} /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
              <p className="mt-1 text-sm text-gray-500">We&apos;ll send you a reset link</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                placeholder="you@company.com"
                leftIcon={<Mail size={16} />}
                error={errors.email?.message}
                required
                {...register('email')}
              />
              <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
                Send reset link
              </Button>
            </form>
            <div className="mt-5 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand">
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </AuthShell>
  )
}
