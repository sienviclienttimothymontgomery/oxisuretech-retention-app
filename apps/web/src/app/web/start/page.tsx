import LoginForm from '@/components/login-form'
import PrototypeNav from '@/components/ui/PrototypeNav'

export default function WebStart() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      <PrototypeNav />
      <main className="flex-1 flex flex-col justify-center items-center p-6">
        <div className="w-full max-w-sm text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">Web Tracker</h1>
          <p className="text-[var(--color-text-muted)]">Enter your email to request a magic link. No password required.</p>
        </div>
        <LoginForm type="web" />
      </main>
    </div>
  )
}
