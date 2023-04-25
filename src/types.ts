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

export type TranscribeErrorReason =
  | "rate-limit"
  | "invalid-url"
  | "invalid-file"
  | "file-type-unsupported"
  | "file-size-too-big"
  | "file-hash-fail"
  | "db-insert-fail"
  | "transcribe-kickoff-fail"
  | "unknown"

export type TranscribeApiResponse =
  | { status: "success"; id: number }
  | {
      status: "error"
      reason: TranscribeErrorReason
    }

export type ResultsApiResponse =
  | { status: "success"; data: AudioRow }
  | { status: "error"; reason: string }

// db types

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type AudioResults =
  | { status: "NOT_STARTED" }
  | { status: "RUNNING" }
  | { status: "SUCCESS"; output: { fileName: string; results: Transcript }[] }
  | { status: "FAILED"; reason: string }

export interface AudioRow {
  audioUrl: string | null
  createdAt: string
  fingerprint: string
  id: number
  inputUrl: string
  metadata: Json | null
  summary: string | null
  title: string | null
  transcription: AudioResults | null
}

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
          transcription: AudioResults | null
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
          transcription?: AudioResults | null
        }
        Update: {
          audioUrl?: string | null
          createdAt?: string
          fingerprint: string
          id?: number
          inputUrl: string
          metadata?: Json | null
          summary?: string | null
          title?: string | null
          transcription?: AudioResults | null
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
