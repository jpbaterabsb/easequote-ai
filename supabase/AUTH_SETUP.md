# Supabase Auth Configuration Guide

This document outlines the steps to configure Supabase Authentication for EaseQuote AI.

## 1. Enable Email/Password Authentication

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Enable **Email** provider
4. Configure email settings:
   - **Enable email confirmations**: Recommended (set to true)
   - **Secure email change**: Enable
   - **Double confirm email changes**: Enable

## 2. Enable Google OAuth

1. Go to **Authentication** > **Providers**
2. Enable **Google** provider
3. Configure Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
   - Configure OAuth consent screen
   - Add authorized redirect URIs:
     - `https://[your-project-ref].supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback` (for local development)
   - Copy **Client ID** and **Client Secret**
   - Paste into Supabase Dashboard > Authentication > Providers > Google

## 3. Configure Email Templates

1. Go to **Authentication** > **Email Templates**
2. Customize templates:
   - **Confirm signup** - Email confirmation template
   - **Magic Link** - Magic link template (if using)
   - **Change Email Address** - Email change template
   - **Reset Password** - Password reset template

### Example Email Template (Confirm Signup)

```html
<h2>Welcome to EaseQuote AI!</h2>
<p>Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>This link will expire in 24 hours.</p>
```

### Example Email Template (Reset Password)

```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link expires in 1 hour.</p>
<p>If you didn't request this, please ignore this email.</p>
```

## 4. Configure Redirect URLs

1. Go to **Authentication** > **URL Configuration**
2. Add Site URL: `https://yourdomain.com` (or `http://localhost:5173` for dev)
3. Add Redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:5173/auth/callback` (for local development)
   - `https://yourdomain.com/reset-password`
   - `http://localhost:5173/reset-password` (for local development)

## 5. Rate Limiting (Built-in)

Supabase Auth has built-in rate limiting:
- **Login attempts**: 5 failed attempts = 15-minute lockout
- **Password reset**: Limited per email
- **Email sending**: Limited per hour

No additional configuration needed - this is handled automatically by Supabase.

## 6. Session Management

Sessions are managed via JWT tokens:
- **Default session duration**: 1 hour
- **Refresh token duration**: 30 days (when "Remember Me" is checked)
- **Auto-refresh**: Enabled by default

## 7. Testing Authentication

### Test Registration Flow:
1. Navigate to `/register`
2. Fill in the form
3. Submit and check email for confirmation link
4. Click confirmation link
5. Should redirect to dashboard

### Test Login Flow:
1. Navigate to `/login`
2. Enter credentials
3. Check "Remember me" for 30-day session
4. Should redirect to dashboard

### Test Password Reset:
1. Navigate to `/forgot-password`
2. Enter email
3. Check email for reset link
4. Click reset link
5. Enter new password
6. Should redirect to login

### Test Google OAuth:
1. Navigate to `/login`
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Should redirect to dashboard

## 8. Environment Variables

Make sure your `.env` file has:
```bash
VITE_SUPABASE_URL=https://njkizbytxifukrhnogxh.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 9. Database Trigger

The `handle_new_user()` function automatically creates a profile when a user signs up. This is already configured in the migrations.

## Troubleshooting

### Email not sending?
- Check Supabase Dashboard > Authentication > Email Templates
- Verify SMTP settings (if using custom SMTP)
- Check spam folder

### Google OAuth not working?
- Verify redirect URIs match exactly
- Check Google Cloud Console credentials
- Ensure OAuth consent screen is configured

### Session not persisting?
- Check browser cookies are enabled
- Verify redirect URLs are configured correctly
- Check Supabase Auth settings

---

**Note:** Rate limiting (auth-11) is handled automatically by Supabase Auth. No additional implementation needed.

