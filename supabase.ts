export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      transcriptions: {
        Row: {
          audioUrl: string | null
          createdAt: string
          fingerprint: string
          id: number
          inputUrl: string
          metadata: Json | null
          summary: string | null
          title: string | null
          transcription: Json | null
        }
        Insert: {
          audioUrl?: string | null
          createdAt?: string
          fingerprint: string
          id?: number
          inputUrl: string
          metadata?: Json | null
          summary?: string | null
          title?: string | null
          transcription?: Json | null
        }
        Update: {
          audioUrl?: string | null
          createdAt?: string
          fingerprint?: string
          id?: number
          inputUrl?: string
          metadata?: Json | null
          summary?: string | null
          title?: string | null
          transcription?: Json | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
