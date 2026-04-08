# Wireframe Reference: Web Onboarding

## Purpose
A minimal-friction path for users who do not want to install an app but still want basic tracking and email reminders.

## Screens & States

### 1. Web Start (`/web/start`)
- **Action**: Enter email, confirm product and quantity on one screen.
- **State**: Single-page form. Continue disabled until valid email format.
- **Copy**: "Quick Setup" / "Email Address" / "Send Me My Link"
- **Hierarchy 1**: Capturing email is paramount.
- **Hierarchy 2**: Product confirmation.
- **Engineering Note**: Trigger a Supabase magic link email upon submission. Creates/updates a user record.

### 2. Check Email (`/web/check-email`)
- **Action**: Open email inbox.
- **State**: Interstitial waiting screen.
- **Copy**: "Check Your Email" / "We sent a magic link..."
- **Hierarchy 1**: Clear instruction to leave the brower and open email.
- **Engineering Note**: The magic link clicked in the email will route back to `/web/dashboard` with a valid session.

## Navigation flow
Landing -> Choose Path (Web) -> Web Start -> Check Email -> (Magic Link click) -> Web Dashboard
