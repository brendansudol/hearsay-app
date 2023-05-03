import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-slate-50 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-sidebar lg:items-start lg:overflow-y-auto">
        <div className="relative z-10 mx-auto p-6 sm:px-6 md:max-w-2xl lg:min-h-full lg:flex-auto lg:border-x lg:border-slate-200 lg:p-8 xl:px-12">
          <div className="text-center lg:mt-12 lg:text-left">
            <p className="text-3xl font-bold text-slate-900">
              <Link className="hover:underline" href="/">
                hearsay
              </Link>
            </p>
            <p className="mt-1 text-lg font-medium leading-snug text-slate-900">
              Transcribe, summarize, & share audio.
            </p>
          </div>
          <AboutSection className="mt-12 hidden lg:block" />
        </div>
      </header>
      <main className="border-t border-slate-200 lg:relative lg:ml-sidebar lg:border-t-0">
        <WaveFormAnimation className="absolute left-0 top-0 w-full" />
        <div className="relative">{children}</div>
      </main>
      <footer className="border-t border-slate-200 bg-slate-50 py-10 sm:py-16 lg:hidden">
        <div className="mx-auto px-8 sm:px-10 md:max-w-2xl">
          <AboutSection />
        </div>
      </footer>
    </>
  )
}

function AboutSection({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Header text="About" />
      <div className="mt-2 text-base leading-7 text-slate-900">
        <p className="mb-5">
          hearsay is a small tool powered by AI (Whisper for transcriptions, GPT-4 for summaries) to
          enrich audio files in seconds.
        </p>
        <p>
          <a href="https://github.com/brendansudol/hearsay-app" className="underline">
            Code on GitHub
          </a>
          <span className="px-3">/</span>
          <a href="https://twitter.com/brensudol" className="underline">
            Made by @brensudol
          </a>
        </p>
      </div>
    </div>
  )
}

function Header({ text }: { text: string }) {
  return (
    <div className="flex items-baseline">
      <div className="flex items-end">
        <div className="mr-0.5 w-1.5 h-2 bg-indigo-300 rounded-md"></div>
        <div className="w-1.5 h-3 bg-blue-300 rounded-md"></div>
      </div>
      <h2 className="ml-2 font-mono text-sm leading-tight font-medium text-slate-900">{text}</h2>
    </div>
  )
}

function WaveFormAnimation({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [bars, setBars] = useState<number[]>([])

  const generate = useCallback(() => {
    if (containerRef.current == null) return
    const width = containerRef.current.offsetWidth
    const count = Math.floor(width / (BAR_WIDTH + BAR_SPACING))
    const newBars = [...Array(count)].map(getHeight)
    setBars(newBars)
  }, [])

  useEffect(() => {
    generate()

    window.addEventListener("resize", generate)
    const intervalId = setInterval(generate, UPDATE_INTERVAL)

    return () => {
      window.removeEventListener("resize", generate)
      clearInterval(intervalId)
    }
  }, [generate])

  return (
    <div className={className} ref={containerRef}>
      <div className="flex justify-around overflow-hidden opacity-50">
        {bars.map((height, idx) => (
          <div
            key={idx}
            className="waveform-bar bg-gradient-to-b from-cyan-300 to-blue-300"
            style={{ width: BAR_WIDTH, height }}
          ></div>
        ))}
      </div>
    </div>
  )
}

const BAR_WIDTH = 6
const BAR_SPACING = 5
const UPDATE_INTERVAL = 4_000
const getHeight = () => Math.floor(Math.random() * 25 + 5)
