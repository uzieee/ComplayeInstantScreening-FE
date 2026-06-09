export interface User {
  id: string
  email: string
  full_name: string
  role: 'super_admin' | 'tenant_admin' | 'analyst' | 'viewer'
  tenant_id: string
  tenant_name: string
  is_active: boolean
  two_factor_enabled: boolean
  created_at: string
  last_login?: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  plan: 'trial' | 'basic' | 'professional' | 'enterprise'
  is_active: boolean
  created_at: string
  search_quota: number
  searches_used: number
}

export interface AuthTokens {
  access_token: string
  token_type: string
  requires_2fa?: boolean
  temp_token?: string
}

export interface DashboardStats {
  total_searches_today: number
  total_searches_month: number
  hits_today: number
  pending_reviews: number
  quota_used: number
  quota_total: number
  recent_activity: ActivityItem[]
  search_trend: TrendPoint[]
  risk_breakdown: RiskBreakdown
}

export interface ActivityItem {
  id: string
  action: string
  entity: string
  result: 'clear' | 'hit' | 'possible_match' | 'pending'
  user: string
  timestamp: string
}

export interface TrendPoint {
  date: string
  searches: number
  hits: number
}

export interface RiskBreakdown {
  clear: number
  hits: number
  possible_matches: number
  pending: number
}

export interface ApiError {
  detail: string | { msg: string; type: string }[]
}
