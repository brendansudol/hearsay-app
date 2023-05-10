import axios from "axios"
import { Frown, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { useCallback, useState } from "react"
import { TranscribeApiResponse, TranscribeErrorReason } from "@/types"
import { isValidUrl } from "@/utils/isValidUrl"

interface State {
  url: string
  isLoading: boolean
  hasSearched: boolean
  error?: TranscribeErrorReason
}

export default function Home() {
  const router = useRouter()

  const [state, _setState] = useState<State>({
    url: "",
    isLoading: false,
    hasSearched: false,
  })

  const setState = useCallback(
    (state: Partial<State>) => _setState((prev) => ({ ...prev, ...state })),
    [_setState]
  )

  const { url, isLoading, hasSearched, error } = state

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      if (!isValidUrl(url)) {
        setState({ hasSearched: true, error: "invalid-url" })
        return
      }

      try {
        setState({ isLoading: true, hasSearched: true, error: undefined })
        const { data } = await axios.post<TranscribeApiResponse>("/api/transcribe", { url })
        if (data.status === "success") return router.push(`/p/${data.id}`)
      } catch (error: any) {
        console.warn(error)
        setState({
          isLoading: false,
          error: error?.response?.data?.reason ?? "unknown",
        })
      }
    },
    [url, setState]
  )

  return (
    <main className="mx-auto px-6 py-10 sm:px-10 max-w-screen-sm">
      <div className="mb-12 lg:mt-24">
        <form className="relative" onSubmit={handleSubmit}>
          <input
            type="text"
            className="block w-full bg-slate-50 rounded-lg border-0 pl-3 pr-[125px] py-4 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-slate-900"
            placeholder="Add audio file URL..."
            required={true}
            value={url}
            onChange={(e) => setState({ url: e.target.value })}
          />
          <div className="absolute inset-y-0 right-0 p-2 flex items-center">
            <button
              type="submit"
              className="px-4 py-0 h-full w-[110px] rounded-md border-0 text-white bg-slate-900 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Transcribe"}
            </button>
          </div>
        </form>
        <div className="mt-2 text-sm text-slate-500">
          250 MB limit; for podcast audio file URLs, try{" "}
          <a className="underline" href="https://podbay.fm/" target="_blank" rel="noreferrer">
            podbay.fm
          </a>
        </div>
      </div>

      {!hasSearched && (
        <div>
          <div className="mb-3">Here are a few examples:</div>
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {EXAMPLES.map((ex, i) => (
              <Link
                key={i}
                className="p-3 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 cursor-pointer"
                href={`/p/${ex.id}`}
              >
                {ex.text}
              </Link>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="p-5 flex bg-green-50 rounded-lg">
          <div className="flex-shrink-0">
            <Loader2 className="h-5 w-5 text-green-400 animate-spin" />
          </div>
          <div className="ml-2 text-sm text-green-700">
            <span className="font-bold">Processing audio...</span>
          </div>
        </div>
      )}

      {error != null && (
        <div className="p-5 flex bg-red-50 rounded-lg">
          <div className="flex-shrink-0">
            <Frown className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-2 text-sm text-red-700">
            <span className="font-bold">Sorry!</span> {getErrorMessage(error)}
          </div>
        </div>
      )}
    </main>
  )
}

const EXAMPLES = [
  {
    text: "This American Life - Me Minus Me",
    id: 8,
  },
  {
    text: "Conan O’Brien Needs A Friend - Bill Burr",
    id: 12,
  },
  {
    text: "Lex Fridman Podcast - Sam Altman",
    id: 9,
  },
  {
    text: "Radiolab - Space",
    id: 7,
  },
]

function getErrorMessage(reason: TranscribeErrorReason): string {
  switch (reason) {
    case "rate-limit":
      return "You’ve reached the submission limit for today. Please come back tomorrow."
    case "invalid-url":
    case "invalid-file":
      return "Invalid file URL. Please try another one."
    case "file-type-unsupported":
      return "Invalid file type. The following are supported: mp3, mp4, mpeg, mpga, m4a, wav, and webm."
    case "file-size-too-big":
      return "File is too large; currently, the limit is 250 MB."
    case "file-hash-fail":
      return "Unable to process this file. Please try another one."
    case "db-insert-fail":
    case "transcribe-kickoff-fail":
    case "unknown":
    default:
      return "Something went wrong. Please try again soon."
  }
}
