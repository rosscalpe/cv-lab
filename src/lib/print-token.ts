import { createHmac } from 'crypto'
import type { CVTranslatableContent } from '@/lib/translate'

const SECRET = process.env.PDF_TOKEN_SECRET ?? 'dev-secret-change-in-prod'
const TTL_MS = 5 * 60 * 1000 // 5 minutes

export interface PrintTokenPayload {
  userId: string
  templateName: string
  locale: string
  exp: number
  /** Campos de texto ya traducidos. Se aplican sobre los datos de la BD al renderizar. */
  overrides?: CVTranslatableContent
  /** Color de acento elegido por el usuario */
  accentColor?: string
}

export function createPrintToken(
  userId: string,
  templateName: string,
  locale: string,
  overrides?: CVTranslatableContent,
  accentColor?: string,
): string {
  const payload: PrintTokenPayload = {
    userId,
    templateName,
    locale,
    exp: Date.now() + TTL_MS,
    ...(overrides ? { overrides } : {}),
    ...(accentColor ? { accentColor } : {}),
  }

  const data = JSON.stringify(payload)
  const b64 = Buffer.from(data).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(b64).digest('base64url')

  return `${b64}.${sig}`
}

export function verifyPrintToken(token: string): PrintTokenPayload {
  const [b64, sig] = token.split('.')

  if (!b64 || !sig) throw new Error('Invalid token format')

  const expectedSig = createHmac('sha256', SECRET).update(b64).digest('base64url')
  if (sig !== expectedSig) throw new Error('Invalid token signature')

  const payload: PrintTokenPayload = JSON.parse(Buffer.from(b64, 'base64url').toString())

  if (Date.now() > payload.exp) throw new Error('Token expired')

  return payload
}
