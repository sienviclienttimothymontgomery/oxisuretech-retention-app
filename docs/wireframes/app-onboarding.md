# Wireframe Reference: App Onboarding

## Purpose
Walk the user through setting up their OxiSure tracker app with the lowest possible friction, ensuring accurate lifecycle tracking and reminder permissions.

## Screens & States

### 1. Welcome (`/app/welcome`)
- **Action**: Acknowledge and start
- **State**: Single full-screen welcome with subtle animation.
- **Copy**: "Your Tubing. Always Fresh. Never Forgotten." / "Let's Get Started"
- **Hierarchy 1**: App Value Proposition
- **Hierarchy 2**: "1 minute setup" reassurance
- **Engineering Note**: First screen in the authenticated stack (post QR scan or direct open).

### 2. User Type (`/app/user-type`)
- **Action**: Select Self vs. Caregiver
- **State**: Radio selection (Card-style). Continue disabled until selected.
- **Copy**: "Who is this for?" / "Just for me" / "I'm a caregiver"
- **Hierarchy 1**: Options defined clearly by iconography.
- **Engineering Note**: Sets the `user_role` state which changes dashboard rendering.

### 3. Confirm Product (`/app/confirm-product`)
- **Action**: Confirm correct product detected from order.
- **State**: Pre-filled product card.
- **Copy**: "Confirm Your Product" / "Recommended replacement cycle: Every 30 days"
- **Hierarchy 1**: The product they bought.
- **Hierarchy 2**: Value-add information about the standard replacement cycle.
- **Engineering Note**: In production, fetches the linked order from the QR token. Requires "wrong product" fallback logic.

### 4. Quantity (`/app/quantity`)
- **Action**: Input tubes used per cycle.
- **State**: Integer stepper (1-10).
- **Copy**: "How Many Do You Use?" / "Tubes replaced per cycle"
- **Accessibility**: 44px+ minimum tap targets on the plus/minus buttons.
- **Engineering Note**: Multiplier for the eventual Shopify checkout handoff.

### 5. Notifications (`/app/notifications`)
- **Action**: Opt-in to Push and Email.
- **State**: OS-native toggle switches.
- **Copy**: "Stay on Schedule" / "Push Notifications" / "Email Reminders"
- **Hierarchy 1**: Active choice of reminder channel.
- **Safety**: Warning displays if both are toggled off.
- **Engineering Note**: Triggers the actual OS push notification prompt when flipped to true. Maps to user preferences table.

## Navigation flow
Welcome -> User Type -> Confirm Product -> Quantity -> Notifications -> Dashboard
