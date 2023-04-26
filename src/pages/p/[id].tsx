import axios from "axios"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AudioRow, ResultsApiResponse, Segment, Transcript as ITranscript } from "@/types"
import { Transcript } from "@/components/Transcript"
import { getEntry } from "@/utils/supabase"

export const getServerSideProps: GetServerSideProps<{ id: string }> = async (context) => {
  const { id } = context.query ?? {}
  if (id == null || Array.isArray(id)) return { notFound: true }

  const { data } = await getEntry(id)
  if (data == null) return { notFound: true }

  return { props: { id } }
}

export default function ResultsPage({
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const [data, setData] = useState<AudioRow>()
  const [currentSegment, setCurrentSegment] = useState<Segment>()
  const [isPolling, setIsPolling] = useState(true) // TODO: init to false if data is ready

  const title = data?.title
  const summary = data?.summary
  const transcript = useMemo(() => constructTranscript(data), [data])

  const handleTranscriptClick = useCallback((segment: Segment) => {
    const audio = audioRef.current
    if (audio == null) return
    setCurrentSegment(segment)
    audio.currentTime = segment.start + 0.01
    if (audio.paused) audio.play()
  }, [])

  const handleTimeUpdate = useCallback(
    (e: FormEvent<HTMLAudioElement>) => {
      const time = e.currentTarget.currentTime
      const curr = currentSegment
      if (transcript == null || (curr != null && curr.start <= time && time < curr.end)) return
      const idx = findSegmentIdx(transcript.segments, time)
      setCurrentSegment(transcript.segments[idx])
    },
    [currentSegment, transcript]
  )

  const handleAudioDataLoaded = useCallback(() => {
    const duration = audioRef.current?.duration
    console.log("DURATION: ", duration)
  }, [])

  useEffect(() => {
    if (!isPolling) return

    const fetchData = async () => {
      try {
        if (id == null) return
        const { data } = await axios.post<ResultsApiResponse>("/api/results", { id })
        if (data.status === "error") throw new Error(data.reason)

        const entry = data.data
        console.log(entry) // TODO: remove
        setData(entry)

        const status = entry.transcription?.status
        if (status === "SUCCESS" || status === "FAILED") setIsPolling(false)
      } catch (error) {
        console.log("error while fetching results", error)
        setIsPolling(false)
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, 10_000)
    return () => clearInterval(intervalId)
  }, [id, isPolling])

  return (
    <div className="mx-auto p-8 sm:px-12 sm:py-16 max-w-screen-md">
      {summary && (
        <div className="mb-8 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="mb-2 font-mono text-sm font-bold leading-none">Summary</div>
          <p>{summary}</p>
        </div>
      )}

      {transcript && (
        <div className="pb-20">
          <div className="mb-2 font-mono text-sm font-bold leading-none">Transcript</div>
          <Transcript
            segments={transcript.segments}
            currentId={currentSegment?.id}
            onSelect={handleTranscriptClick}
          />
        </div>
      )}

      {data?.audioUrl && (
        <div className="fixed inset-x-0 bottom-0 z-10 lg:left-sidebar">
          <div className="flex items-center gap-6 bg-white/90 px-4 py-4 shadow shadow-slate-200/80 ring-1 ring-slate-900/5 backdrop-blur-sm lg:p-6">
            <audio
              ref={audioRef}
              autoPlay={true}
              className="w-full"
              controls={true}
              onTimeUpdate={handleTimeUpdate}
              onLoadedData={handleAudioDataLoaded}
              src={data.audioUrl}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function constructTranscript(data: AudioRow | undefined): ITranscript | undefined {
  if (data == null || data.transcription?.status !== "SUCCESS") return

  const { output } = data.transcription
  if (output.length === 0) return
  if (output.length === 1) return output[0].results

  let [timeOffset, idOffset, textAll] = [0, 0, ""]
  const segmentsAll = []
  for (const entry of output) {
    const { duration, segments, text } = entry.results
    for (const segment of segments) {
      segmentsAll.push({
        id: segment.id + idOffset,
        start: segment.start + timeOffset,
        end: segment.end + timeOffset,
        text: segment.text,
      })
    }
    timeOffset += duration
    idOffset += segments.length
    textAll += text + " "
  }

  return {
    ...output[0].results,
    duration: timeOffset,
    segments: segmentsAll,
    text: textAll,
  }
}

function findSegmentIdx(segments: Segment[], target: number) {
  let [lo, hi] = [0, segments.length]
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2)
    if (target >= segments[mid].end) lo = mid + 1
    else hi = mid
  }
  return lo
}
