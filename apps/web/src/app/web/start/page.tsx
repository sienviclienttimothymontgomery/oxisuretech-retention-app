import LoginForm from '@/components/login-form'
import Image from 'next/image'
import Link from 'next/link'

export default function WebStart() {
  return (
    <div className="page-container justify-center pb-8">
      <header className="flex items-center justify-center py-2">
        <Image src="/logo.png" alt="OxiSure Tech" width={320} height={96} className="h-24 w-auto" />
      </header>
      <div className="w-full max-w-sm text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Web Tracker</h1>
        <p className="text-[var(--color-text-muted)]">Enter your email to receive a magic link. No password required.</p>
      </div>
      <LoginForm type="web" />
      <Link
        href="/choose-path"
        className="block text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors py-1 mt-4"
      >
        ← Back
      </Link>
    </div>
  )
}
