import axios from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { TranscribeApiResponse, TranscribeErrorReason } from "@/types"
import { getFileMetadata, hashPartialFile } from "@/utils/fileUtils"
import { isValidUrl } from "@/utils/isValidUrl"
import { checkExists, supabase } from "@/utils/supabase"

const CACHE = new Map()
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.fixedWindow(5, "12 h"),
  ephemeralCache: CACHE,
})

const SUPPORTED_FILE_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"]
const MAX_FILE_SIZE = 250_000_000 // 250 MB

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TranscribeApiResponse>
) {
  function errorResponse(reason: TranscribeErrorReason, statusCode: number = 500) {
    return res.status(statusCode).json({ status: "error", reason })
  }

  await sleep(1_000)

  try {
    const { url } = req.body
    if (!isValidUrl(url)) return errorResponse("invalid-url")

    const { contentType, contentLength } = (await getFileMetadata(url)) ?? {}
    if (contentType == null || contentLength == null) {
      return errorResponse("invalid-file")
    } else if (!SUPPORTED_FILE_TYPES.includes(contentType)) {
      return errorResponse("file-type-unsupported")
    } else if (Number.isNaN(contentLength) || contentLength > MAX_FILE_SIZE) {
      return errorResponse("file-size-too-big")
    }

    const ip = getIp(req)
    const { success } = await ratelimit.limit(ip)
    if (!success) return errorResponse("rate-limit", 429)

    const fileHash = await hashPartialFile(url)
    if (fileHash == null) return errorResponse("file-hash-fail")

    const fingerprint = `${fileHash}-${contentLength}-${contentType}`
    const existing = await checkExists(url, fingerprint)
    if (existing != null) {
      return res.status(200).json({ status: "success", id: existing.id })
    }

    const insert = await supabase
      .from("transcriptions")
      .insert({
        inputUrl: url,
        fingerprint,
        metadata: { contentType, contentLength },
        transcription: { status: "NOT_STARTED" },
      })
      .select()

    const id = insert.data?.[0].id
    if (id == null) return errorResponse("db-insert-fail")

    const lambdaParams = { audioUrl: url, dbId: id }
    const response = await axios.post(process.env.LAMBDA_URL!, lambdaParams)

    return response.status === 200
      ? res.status(200).json({ status: "success", id })
      : errorResponse("transcribe-kickoff-fail")
  } catch (error) {
    console.error(error)
    return errorResponse("unknown")
  }
}

function getIp(req: NextApiRequest): string {
  return (
    parseHeader(req.headers["x-real-ip"]) ??
    parseHeader(req.headers["x-forwarded-for"]) ??
    req.socket.remoteAddress ??
    "__FALLBACK_IP__"
  )
}

function parseHeader(header: string | string[] | undefined): string | undefined {
  if (header == null) return undefined
  return Array.isArray(header) ? header[0] : header
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
