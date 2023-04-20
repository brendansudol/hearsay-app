import type { NextApiRequest, NextApiResponse } from "next"
import { ResultsApiResponse } from "@/types"
import { getErrorMessage } from "@/utils/getErrorMessage"
import { getEntry } from "@/utils/supabase"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResultsApiResponse>
) {
  const errorResponse = (reason: string) => res.status(500).json({ status: "error", reason })

  const { id } = req.body
  if (id == null) {
    return errorResponse("no-id")
  }

  try {
    const { data } = await getEntry(id)
    return data == null
      ? errorResponse("no-entry")
      : res.status(200).json({ status: "success", data })
  } catch (error) {
    console.error(error)
    return errorResponse(getErrorMessage(error))
  }
}
