'use client'

import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import InputField from '@/components/ui/InputField'

export default function LoginForm({ type, redirectTo }: { type: 'app' | 'web'; redirectTo?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [webMode, setWebMode] = useState<'password' | 'magic'>('password')
  const supabase = createClient()

  const destination = type === 'web' ? '/web/dashboard' : (redirectTo ?? '/app/dashboard')

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${destination}`,
      },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (type === 'web' && webMode === 'magic') {
      // Magic link via Edge Function (uses Resend for branded emails)
      let sent = false
      try {
        const { error, data } = await supabase.functions.invoke('send-magic-link', {
          body: { 
            email, 
            redirectTo: `${window.location.origin}/auth/verify-hash?next=/web/dashboard` 
          }
        })
        if (error) throw error
        if (data?.error) throw new Error(data.error)
        sent = true
      } catch (e: any) {
        console.warn('Edge Function failed:', e?.message)
      }

      // Fallback: only if Edge Function is completely unreachable
      if (!sent) {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/web/dashboard`,
          },
        })
        if (otpError) {
          setError(otpError.message)
          setLoading(false)
          return
        }
      }

      window.location.href = '/web/check-email'
    } else {
      // Password login (works for both app and web)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setError(error.message)
      else {
        window.location.href = destination
      }
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${destination}`,
      },
    })
    if (error) setError(error.message)
    else setMessage('Check your email to confirm your account.')
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=${destination}`,
    })
    if (error) setError(error.message)
    else setMessage('Password reset link sent to your email.')
    setLoading(false)
  }

  const showPasswordField = type === 'app' || webMode === 'password'

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Error / Success Messages */}
      {error && (
        <div className="text-sm text-center p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 font-medium">
          {error}
        </div>
      )}
      {message && (
        <div className="text-sm text-center p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-medium">
          {message}
        </div>
      )}
      
      {/* Web mode toggle — pill style */}
      {type === 'web' && (
        <div className="flex p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
          <button
            type="button"
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              webMode === 'password'
                ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
                : 'text-[#94A3B8] hover:text-[#64748B]'
            }`}
            onClick={() => setWebMode('password')}
          >
            Password
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              webMode === 'magic'
                ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
                : 'text-[#94A3B8] hover:text-[#64748B]'
            }`}
            onClick={() => setWebMode('magic')}
          >
            ✉️ Magic Link
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <InputField
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {showPasswordField && (
          <div>
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex justify-end mt-1.5">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-medium text-[#0EA5E9] hover:text-[#0284C7] transition-colors min-h-0"
              >
                Forgot password?
              </button>
            </div>
          </div>
        )}
        <Button type="submit" loading={loading} fullWidth>
          {type === 'web' && webMode === 'magic' ? '✉️ Send Magic Link' : 'Sign In'}
        </Button>
      </form>

      {/* Sign Up CTA */}
      {showPasswordField && (
        <div className="text-center py-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <p className="text-sm text-[#64748B]">
            Don&apos;t have an account?{' '}
            <button 
              type="button" 
              onClick={handleSignUp}
              className="font-bold text-[#1B365D] hover:text-[#0EA5E9] transition-colors min-h-0"
              disabled={loading}
            >
              Create one →
            </button>
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[#E2E8F0]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-[#94A3B8] font-medium tracking-wider">
            or continue with
          </span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="flex gap-3">
        {/* Google */}
        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 bg-white border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all shadow-sm hover:shadow min-h-[48px]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>

        {/* Apple — dark style per brand guidelines */}
        <button
          type="button"
          onClick={() => handleOAuthLogin('apple')}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 bg-black border border-black rounded-xl text-sm font-semibold text-white hover:bg-[#1a1a1a] transition-all shadow-sm hover:shadow min-h-[48px]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.34 10.63c-.02-2.15 1.77-3.21 1.85-3.26-1-1.46-2.56-1.67-3.11-1.7-1.33-.14-2.59.78-3.27.78-.68 0-1.72-.75-2.82-.73-1.43.02-2.75.83-3.48 2.1-1.5 2.58-.38 6.4 1.07 8.5.72 1.03 1.56 2.17 2.66 2.13 1.07-.04 1.48-.69 2.78-.69 1.3 0 1.68.69 2.79.67 1.14-.02 1.88-1.06 2.58-2.09.81-1.18 1.15-2.32 1.16-2.38-.02-.01-2.2-8.5-2.21-3.33z" />
            <path d="M14.95 6.53c.6-.72 1-1.72.89-2.72-.85.03-1.89.57-2.51 1.3-.55.63-1.02 1.66-.89 2.64.95.07 1.91-.49 2.51-1.22z" />
          </svg>
          Apple
        </button>
      </div>
    </div>
  )
}
