import LoginForm from '@/components/login-form'
import Image from 'next/image'
import Link from 'next/link'

export default function AppLogin() {
  return (
    <div className="page-container justify-center pb-8">
      <header className="flex items-center justify-center py-2">
        <Image src="/logo.png" alt="OxiSure Tech" width={320} height={96} className="h-24 w-auto" />
      </header>
      <div className="w-full max-w-sm text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Welcome Back</h1>
        <p className="text-[var(--color-text-muted)]">Sign in to your OxiSure account.</p>
      </div>
      <LoginForm type="app" redirectTo="/app/user-type" />
      <Link
        href="/choose-path"
        className="block text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors py-1 mt-4"
      >
        ← Back
      </Link>
    </div>
  )
}
