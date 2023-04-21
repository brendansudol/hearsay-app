import axios from "axios"
import Head from "next/head"
import { useRouter } from "next/router"
import React, { useCallback, useMemo, useState } from "react"
import { TranscribeApiResponse } from "@/types"
import { isValidUrl } from "@/utils/isValidUrl"

export default function Home() {
  const router = useRouter()

  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>()

  const isDisabled = useMemo(() => {
    return url.trim().length === 0 || !isValidUrl(url)
  }, [url])

  const handleSubmit = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(undefined)
      const { data } = await axios.post<TranscribeApiResponse>("/api/transcribe", { url })
      if (data.status === "success") router.push(`/p/${data.id}`)
    } catch (error: any) {
      console.warn(error)
      setError(error?.response?.data?.reason ?? "unknown")
    } finally {
      setIsLoading(false)
    }
  }, [url])

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
          <div className="relative">
            <input
              type="text"
              className="block w-full bg-gray-50 rounded-lg border-0 pl-3 pr-28 py-4 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-400"
              placeholder="Audio file URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 p-2 flex items-center">
              <button
                className="px-4 py-0 h-full rounded-md border-0 text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                disabled={isDisabled || isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? "Saving..." : "Transcribe"}
              </button>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Bacon ipsum dolor amet ball tip sirloin meatloaf picanha chuck kevin spare ribs
            drumstick chislic. Frankfurter jowl shankle leberkas tenderloin.
          </div>
        </div>

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

        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
      </main>
    </>
  )
}

const EXAMPLES = ["foo", "bar", "baz", "qux"]
