import { supabase } from '@/lib/supabase/client'

export interface AuditLogData {
  entity_type: 'quote' | 'customer' | 'profile'
  entity_id: string
  action: 'created' | 'updated' | 'deleted' | 'status_changed'
  old_values?: Record<string, any>
  new_values?: Record<string, any>
}

export async function logAuditEvent(data: AuditLogData): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.warn('Cannot log audit event: user not authenticated')
      return
    }

    // Get user agent and IP (if available)
    const userAgent = navigator.userAgent
    // Note: IP address would need to be obtained server-side in production

    const { error } = await supabase.from('audit_log').insert({
      user_id: user.id,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      action: data.action,
      old_values: data.old_values || null,
      new_values: data.new_values || null,
      user_agent: userAgent,
    })

    if (error) {
      console.error('Error logging audit event:', error)
      // Don't throw - audit logging should not break the main flow
    }
  } catch (error) {
    console.error('Error logging audit event:', error)
    // Don't throw - audit logging should not break the main flow
  }
}

