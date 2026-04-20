import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import RootErrorComponent from '#/components/root-error-component'
import { ThemeProvider } from '#/components/theme-provider'
import { Toaster } from '#/components/ui/sonner'
import { TooltipProvider } from '#/components/ui/tooltip'
import ClerkProvider from '../integrations/clerk/provider'
import ConvexProvider from '../integrations/convex/provider'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'c11 Finances',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
  }),
  shellComponent: RootDocument,
  errorComponent: RootErrorComponent,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-svh font-sans antialiased [overflow-wrap:anywhere]">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider>
            <ConvexProvider>
              <TooltipProvider>
                {children}
                <Toaster closeButton={false} />
                <TanStackDevtools
                  config={{
                    position: 'bottom-right',
                  }}
                  plugins={[
                    {
                      name: 'Tanstack Router',
                      render: <TanStackRouterDevtoolsPanel />,
                    },
                  ]}
                />
              </TooltipProvider>
            </ConvexProvider>
          </ClerkProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
