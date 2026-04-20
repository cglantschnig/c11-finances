import { auth } from '@clerk/tanstack-react-start/server'
import { ConvexHttpClient } from 'convex/browser'

function getConvexUrl() {
  const url = process.env.VITE_CONVEX_URL
  if (!url) {
    throw new Error('Missing VITE_CONVEX_URL.')
  }
  return url
}

async function getConvexToken() {
  const authState = await auth()
  if (!authState.isAuthenticated) {
    throw new Error('You must be signed in.')
  }

  if (authState.sessionClaims?.aud === 'convex') {
    return await authState.getToken()
  }

  return await authState.getToken({ template: 'convex' })
}

export async function getAuthenticatedConvexClient() {
  const token = await getConvexToken()
  if (!token) {
    throw new Error('Unable to authenticate Convex request.')
  }

  const client = new ConvexHttpClient(getConvexUrl())
  client.setAuth(token)
  return client
}
