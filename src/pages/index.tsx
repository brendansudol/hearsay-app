import axios from "axios"
import { Frown, Loader2 } from "lucide-react"
import Head from "next/head"
import { useRouter } from "next/router"
import React, { useCallback, useMemo, useState } from "react"
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
        setState({ error: error?.response?.data?.reason ?? "unknown" })
      } finally {
        setState({ isLoading: false })
      }
    },
    [url, setState]
  )

  return (
    <>
      <Head>
        <title>TODO</title>
        <meta name="description" content="TODO" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* TODO: add proper favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto px-6 py-10 sm:px-10 max-w-screen-sm">
        <div className="mb-12 lg:mt-24">
          <form className="relative" onSubmit={handleSubmit}>
            <input
              type="text"
              className="block w-full bg-gray-50 rounded-lg border-0 pl-3 pr-[125px] py-4 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-gray-900"
              placeholder="Audio file URL..."
              required={true}
              value={url}
              onChange={(e) => setState({ url: e.target.value })}
            />
            <div className="absolute inset-y-0 right-0 p-2 flex items-center">
              <button
                type="submit"
                className="px-4 py-0 h-full w-[110px] rounded-md border-0 text-white bg-gray-900 hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Transcribe"}
              </button>
            </div>
          </form>
          <div className="mt-3 text-sm text-gray-600">
            Bacon ipsum dolor amet ball tip sirloin meatloaf picanha chuck kevin spare ribs
            drumstick chislic. Frankfurter jowl shankle leberkas tenderloin.
          </div>
        </div>

        {!hasSearched && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            {EXAMPLES.map((ex, i) => (
              <div
                key={i}
                className="p-3 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer"
              >
                Example {i + 1}: {`${ex} `.repeat(5)}
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="p-5 flex bg-green-50 rounded-lg">
            <div className="flex-shrink-0">
              <Loader2 className="h-5 w-5 text-green-400 animate-spin" />
            </div>
            <div className="ml-3 text-sm text-green-700">
              <span className="font-bold">Processing audio file...</span>
            </div>
          </div>
        )}

        {error != null && (
          <div className="p-5 flex bg-red-50 rounded-lg">
            <div className="flex-shrink-0">
              <Frown className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3 text-sm text-red-700">
              <span className="font-bold">Sorry!</span> {getErrorMessage(error)}
            </div>
          </div>
        )}
      </main>
    </>
  )
}

const EXAMPLES = ["foo", "bar", "baz", "qux"]

function getErrorMessage(reason: TranscribeErrorReason): string {
  // TODO: add nice error messages for each reason
  return reason
}
