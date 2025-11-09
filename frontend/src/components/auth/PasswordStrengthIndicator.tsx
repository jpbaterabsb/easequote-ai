import { useMemo } from 'react'

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    if (!password) return { level: 0, label: '', color: '' }

    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 2) return { level: score, label: 'Weak', color: 'bg-red-500' }
    if (score <= 4) return { level: score, label: 'Medium', color: 'bg-yellow-500' }
    return { level: score, label: 'Strong', color: 'bg-green-500' }
  }, [password])

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${(strength.level / 6) * 100}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{strength.label}</span>
      </div>
    </div>
  )
}

