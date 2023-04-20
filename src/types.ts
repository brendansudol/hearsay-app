export interface Transcript {
  duration: number
  language: string
  segments: Segment[]
  task: string
  text: string
}

export interface Segment {
  id: number
  start: number
  end: number
  text: string
}

// api types

export type TranscribeApiResponse =
  | { status: "success"; id: number }
  | { status: "error"; reason: string }

export type ResultsApiResponse =
  | { status: "success"; data: AudioRow }
  | { status: "error"; reason: string }

// db types

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type AudioResults =
  | { status: "NOT_STARTED" }
  | { status: "RUNNING" }
  | { status: "SUCCESS"; results: { fileName: string; results: Transcript }[] }
  | { status: "FAILED"; reason: string }

export interface AudioRow {
  audioUrl: string | null
  createdAt: string | null
  displayName: string | null
  fingerprint: string | null
  id: number
  inputUrl: string | null
  metadata: Json | null
  results: AudioResults | null
}

export interface Database {
  public: {
    Tables: {
      audio: {
        Row: {
          audioUrl: string | null
          createdAt: string | null
          displayName: string | null
          fingerprint: string | null
          id: number
          inputUrl: string | null
          metadata: Json | null
          results: AudioResults | null
        }
        Insert: {
          audioUrl?: string | null
          createdAt?: string | null
          displayName?: string | null
          fingerprint?: string | null
          id?: number
          inputUrl?: string | null
          metadata?: Json | null
          results?: AudioResults | null
        }
        Update: {
          audioUrl?: string | null
          createdAt?: string | null
          displayName?: string | null
          fingerprint?: string | null
          id?: number
          inputUrl?: string | null
          metadata?: Json | null
          results?: AudioResults | null
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
