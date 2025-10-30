export type IdeaStatus = 'idea' | 'recorded' | 'posted'
export type FunnelStage = 'top' | 'middle' | 'bottom'
export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'facebook'

export interface IdeaPlatform {
  id: string
  idea_id: string
  platform: Platform
  platform_post_id: string | null
  post_url: string | null
  posted_at: string | null
  is_posted: boolean
  metrics?: Metrics[]
}

export interface Metrics {
  id: string
  idea_platform_id: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  impressions: number
  engagement_rate: number
  recorded_at: string
  source: 'manual' | 'instagram_api'
}

export interface Idea {
  id: string
  user_id: string
  title: string
  theme: string | null
  script: string | null
  editor_instructions: string | null
  status: IdeaStatus
  funnel_stage: FunnelStage
  thumbnail_url: string | null
  created_at: string
  updated_at: string
  recorded_at: string | null
  posted_at: string | null
  platforms?: IdeaPlatform[]
}

export interface IdeaFormData {
  title: string
  theme: string
  script: string
  editor_instructions: string
  status: IdeaStatus
  funnel_stage: FunnelStage
  platforms: Platform[]
}
