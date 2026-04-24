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
  const supabase = createClient()

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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

    if (type === 'web') {
      // Magic link for Web Tracker
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/web/dashboard`,
        },
      })
      if (error) {
        if (error.message.toLowerCase().includes('rate limit') || error.status === 429) {
          setError('Too many requests. Please wait a moment before trying again.')
        } else {
          setError(error.message)
        }
      } else {
        window.location.href = '/web/check-email'
      }
    } else {
      // Password login for App
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setError(error.message)
      else {
        window.location.href = redirectTo ?? '/app/dashboard'
      }
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    if (type === 'web') return // Web uses OTP only
    setLoading(true)
    setError(null)
    setMessage(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
    else setMessage('Check your email to confirm your account.')
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-6">
      {error && <div className="text-[var(--color-danger)] text-sm text-center p-3 bg-[var(--color-danger)]/10 rounded">{error}</div>}
      {message && <div className="text-[var(--color-success)] text-sm text-center p-3 bg-[var(--color-success)]/10 rounded">{message}</div>}
      
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <InputField
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {type === 'app' && (
          <InputField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}
        <Button type="submit" loading={loading} fullWidth>
          {type === 'web' ? 'Send Magic Link' : 'Sign In'}
        </Button>
      </form>

      {type === 'app' && (
        <>
          <div className="text-center">
            <button 
              type="button" 
              onClick={handleSignUp}
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              disabled={loading}
            >
              No account? Sign up
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--color-bg)] px-2 text-[var(--color-text-muted)]">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              icon={
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              }
            >
              Google
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => handleOAuthLogin('apple')}
              disabled={loading}
              icon={
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" className="invisible" />
                  <path d="M16.34 10.63c-.02-2.15 1.77-3.21 1.85-3.26-1-1.46-2.56-1.67-3.11-1.7-1.33-.14-2.59.78-3.27.78-.68 0-1.72-.75-2.82-.73-1.43.02-2.75.83-3.48 2.1-1.5 2.58-.38 6.4 1.07 8.5.72 1.03 1.56 2.17 2.66 2.13 1.07-.04 1.48-.69 2.78-.69 1.3 0 1.68.69 2.79.67 1.14-.02 1.88-1.06 2.58-2.09.81-1.18 1.15-2.32 1.16-2.38-.02-.01-2.2-8.5-2.21-3.33z" />
                  <path d="M14.95 6.53c.6-.72 1-1.72.89-2.72-.85.03-1.89.57-2.51 1.3-.55.63-1.02 1.66-.89 2.64.95.07 1.91-.49 2.51-1.22z" />
                </svg>
              }
            >
              Apple
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
