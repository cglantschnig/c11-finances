import { AlertTriangle, CircleOff } from 'lucide-react'

type SetupStateProps = {
  description: string
  missing: string[]
  title: string
}

export default function SetupState({
  description,
  missing,
  title,
}: SetupStateProps) {
  return (
    <main className="page-wrap px-1 py-3 md:px-0 md:py-4">
      <section className="workspace-frame flex min-h-[calc(100svh-1.5rem)] items-center justify-center rounded-[2rem] px-4 py-10 md:rounded-[2.15rem] md:px-8">
        <div className="app-shell grid w-full max-w-3xl gap-6 rounded-[1.8rem] p-8 md:p-10">
          <div className="flex items-start gap-4">
            <div className="rounded-[1.1rem] border border-[hsl(var(--warning)/0.24)] bg-[hsl(var(--warning)/0.12)] p-3 text-[hsl(var(--warning))]">
              <AlertTriangle className="size-6" />
            </div>
            <div className="space-y-2">
              <p className="eyebrow">Configuration Required</p>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground md:text-4xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                {description}
              </p>
            </div>
          </div>

          <div className="panel-muted rounded-[1.45rem] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
              <CircleOff className="size-4 text-[hsl(var(--warning))]" />
              Missing environment variables
            </div>
            <div className="flex flex-wrap gap-2">
              {missing.map((item) => (
                <code
                  key={item}
                  className="rounded-full border border-border bg-background/20 px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {item}
                </code>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
