import Link from "next/link"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-slate-50 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-sidebar lg:items-start lg:overflow-y-auto">
        <div className="relative z-10 mx-auto p-6 sm:px-6 md:max-w-2xl lg:min-h-full lg:flex-auto lg:border-x lg:border-slate-200 lg:p-8 xl:px-12">
          <div className="text-center lg:mt-12 lg:text-left">
            <p className="text-3xl font-bold text-slate-900">
              <Link href="/">hearsay</Link>
            </p>
            <p className="mt-3 text-lg font-medium leading-normal text-slate-700">
              Bacon ipsum dolor amet ball tip sirloin meatloaf picanha chuck kevin spare ribs.
            </p>
          </div>
          <AboutSection className="mt-12 hidden lg:block" />
        </div>
      </header>
      <main className="border-t border-slate-200 lg:relative lg:mb-28 lg:ml-sidebar lg:border-t-0">
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
    <section className={className}>
      <h2 className="flex items-center font-mono text-sm font-medium leading-7 text-slate-900">
        <WaveFormIcon className="h-2.5 w-2.5" color1="fill-violet-300" color2="fill-pink-300" />
        <span className="ml-2.5">About</span>
      </h2>
      <p className="mt-2 text-base leading-7 text-slate-700">
        Bacon ipsum dolor amet ball tip sirloin meatloaf picanha chuck kevin spare ribs drumstick
        chislic. Frankfurter jowl shankle leberkas tenderloin, bacon strip steak biltong ball tip
        tail sausage boudin. Sausage prosciutto pork, meatloaf boudin tri-tip drumstick ribeye
        buffalo ground round tongue chislic. Venison rump turkey shank. Chislic buffalo pastrami
        turducken leberkas. Sausage pig sirloin pastrami jerky. Jowl frankfurter prosciutto jerky
        sausage bresaola.
      </p>
    </section>
  )
}

function WaveFormIcon({
  className,
  color1,
  color2,
}: {
  className?: string
  color1: string
  color2: string
}) {
  return (
    <svg className={className} aria-hidden="true" viewBox="0 0 10 10">
      <path
        d="M0 5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V5Z"
        className={color1}
      />
      <path
        d="M6 1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V1Z"
        className={color2}
      />
    </svg>
  )
}
