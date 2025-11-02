export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ideas: {
        Row: {
          id: string
          user_id: string
          title: string
          theme: string | null
          script: string | null
          editor_instructions: string | null
          status: 'idea' | 'recorded' | 'posted'
          funnel_stage: 'top' | 'middle' | 'bottom'
          thumbnail_url: string | null
          created_at: string
          updated_at: string
          recorded_at: string | null
          posted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          theme?: string | null
          script?: string | null
          editor_instructions?: string | null
          status?: 'idea' | 'recorded' | 'posted'
          funnel_stage: 'top' | 'middle' | 'bottom'
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
          recorded_at?: string | null
          posted_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          theme?: string | null
          script?: string | null
          editor_instructions?: string | null
          status?: 'idea' | 'recorded' | 'posted'
          funnel_stage?: 'top' | 'middle' | 'bottom'
          thumbnail_url?: string | null
          created_at?: string
          updated_at?: string
          recorded_at?: string | null
          posted_at?: string | null
        }
      }
      idea_platforms: {
        Row: {
          id: string
          idea_id: string
          platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook'
          platform_post_id: string | null
          post_url: string | null
          posted_at: string | null
          is_posted: boolean
        }
        Insert: {
          id?: string
          idea_id: string
          platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook'
          platform_post_id?: string | null
          post_url?: string | null
          posted_at?: string | null
          is_posted?: boolean
        }
        Update: {
          id?: string
          idea_id?: string
          platform?: 'instagram' | 'tiktok' | 'youtube' | 'facebook'
          platform_post_id?: string | null
          post_url?: string | null
          posted_at?: string | null
          is_posted?: boolean
        }
      }
      metrics: {
        Row: {
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
        Insert: {
          id?: string
          idea_platform_id: string
          views?: number
          likes?: number
          comments?: number
          shares?: number
          saves?: number
          reach?: number
          impressions?: number
          engagement_rate?: number
          recorded_at?: string
          source?: 'manual' | 'instagram_api'
        }
        Update: {
          id?: string
          idea_platform_id?: string
          views?: number
          likes?: number
          comments?: number
          shares?: number
          saves?: number
          reach?: number
          impressions?: number
          engagement_rate?: number
          recorded_at?: string
          source?: 'manual' | 'instagram_api'
        }
      }
      instagram_accounts: {
        Row: {
          id: string
          user_id: string
          instagram_user_id: string
          username: string
          access_token: string
          token_expires_at: string | null
          account_type: string | null
          followers_count: number
          follows_count: number
          media_count: number
          profile_picture_url: string | null
          connected_at: string
          last_sync_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          instagram_user_id: string
          username: string
          access_token: string
          token_expires_at?: string | null
          account_type?: string | null
          followers_count?: number
          follows_count?: number
          media_count?: number
          profile_picture_url?: string | null
          connected_at?: string
          last_sync_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          instagram_user_id?: string
          username?: string
          access_token?: string
          token_expires_at?: string | null
          account_type?: string | null
          followers_count?: number
          follows_count?: number
          media_count?: number
          profile_picture_url?: string | null
          connected_at?: string
          last_sync_at?: string | null
          is_active?: boolean
        }
      }
      instagram_posts: {
        Row: {
          id: string
          instagram_account_id: string
          instagram_media_id: string
          media_type: string
          caption: string | null
          permalink: string
          thumbnail_url: string | null
          timestamp: string
          like_count: number
          comments_count: number
          impressions: number
          reach: number
          saved: number
          video_views: number
          engagement_rate: number
          synced_at: string
        }
        Insert: {
          id?: string
          instagram_account_id: string
          instagram_media_id: string
          media_type: string
          caption?: string | null
          permalink: string
          thumbnail_url?: string | null
          timestamp: string
          like_count?: number
          comments_count?: number
          impressions?: number
          reach?: number
          saved?: number
          video_views?: number
          engagement_rate?: number
          synced_at?: string
        }
        Update: {
          id?: string
          instagram_account_id?: string
          instagram_media_id?: string
          media_type?: string
          caption?: string | null
          permalink?: string
          thumbnail_url?: string | null
          timestamp?: string
          like_count?: number
          comments_count?: number
          impressions?: number
          reach?: number
          saved?: number
          video_views?: number
          engagement_rate?: number
          synced_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      idea_status: 'idea' | 'recorded' | 'posted'
      funnel_stage: 'top' | 'middle' | 'bottom'
      platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook'
      metric_source: 'manual' | 'instagram_api'
    }
  }
}
