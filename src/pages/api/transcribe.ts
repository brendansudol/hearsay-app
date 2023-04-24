import axios from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
import { TranscribeApiResponse, TranscribeErrorReason } from "@/types"
import { getFileMetadata, hashPartialFile } from "@/utils/fileUtils"
import { isValidUrl } from "@/utils/isValidUrl"
import { checkExists, supabase } from "@/utils/supabase"

const SUPPORTED_FILE_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav"]
const MAX_FILE_SIZE = 250_000_000 // 250 MB

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TranscribeApiResponse>
) {
  function errorResponse(reason: TranscribeErrorReason) {
    return res.status(500).json({ status: "error", reason })
  }

  await sleep(1_000)

  try {
    const { url } = req.body
    if (!isValidUrl(url)) {
      return errorResponse("invalid-url")
    }

    const { contentType, contentLength } = (await getFileMetadata(url)) ?? {}
    if (contentType == null || contentLength == null) {
      return errorResponse("invalid-file")
    } else if (!SUPPORTED_FILE_TYPES.includes(contentType)) {
      return errorResponse("file-type-unsupported")
    } else if (Number.isNaN(contentLength) || contentLength > MAX_FILE_SIZE) {
      return errorResponse("file-size-too-big")
    }

    const fileHash = await hashPartialFile(url)
    if (fileHash == null) {
      return errorResponse("file-hash-fail")
    }

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
    if (id == null) {
      return errorResponse("db-insert-fail")
    }

    const lambdaParams = { audioUrl: url, dbId: id }
    const response = await axios.post(process.env.LAMBDA_URL!, lambdaParams)
    if (response.status !== 200) {
      return errorResponse("transcribe-kickoff-fail")
    }

    return res.status(200).json({ status: "success", id })
  } catch (error) {
    console.error(error)
    return errorResponse("unknown")
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
