import { Keypair, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import nacl from 'tweetnacl'
import { sha256 } from 'js-sha256'
import { generateMnemonic as bip39GenerateMnemonic, mnemonicToSeedSync, validateMnemonic } from 'bip39'
import { derivePath } from 'ed25519-hd-key'

// Default Solana BIP44 derivation path, matching wallets like Phantom/Solflare.
const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'"

export const sign = (message: string | Uint8Array, privateKeyBase58: string) => {
  try {
    const secretKey = bs58.decode(privateKeyBase58)
    const msg = typeof message === 'string' ? new TextEncoder().encode(message) : message
    const signature = nacl.sign.detached(msg, secretKey)
    return bs58.encode(signature)
  } catch (error) {
    console.error('Error signing message:', error)
    return ''
  }
}

export const verify = (message: string | Uint8Array, signatureBase58: string, publicKeyBase58: string) => {
  try {
    const signature = bs58.decode(signatureBase58)
    const pubkeyBytes = new PublicKey(publicKeyBase58).toBytes()
    const msg = typeof message === 'string' ? new TextEncoder().encode(message) : message
    return nacl.sign.detached.verify(msg, signature, pubkeyBytes)
  } catch (error) {
    console.error('Error verifying signature:', error)
    return false
  }
}

export const transformKeypair = (keypair: Keypair) => {
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: bs58.encode(keypair.secretKey),
  }
}

const hexToBytes = (hex: string) => {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/**
 * Resolves a connected secret-key input into a Solana keypair, auto-detecting the format:
 * - 64 hex chars (e.g. a SHA-256 hash) -> used directly as a 32-byte ed25519 seed
 * - base58 decoding to 64 bytes        -> a full secret key
 * - base58 decoding to 32 bytes        -> a seed
 * Returns null when the value is empty or not a recognized format.
 */
export const keypairFromSecretInput = (value: string): Keypair | null => {
  const input = value.trim()
  if (!input) return null
  try {
    if (/^[0-9a-fA-F]{64}$/.test(input)) {
      return Keypair.fromSeed(hexToBytes(input))
    }
    const decoded = bs58.decode(input)
    if (decoded.length === 64) return Keypair.fromSecretKey(decoded)
    if (decoded.length === 32) return Keypair.fromSeed(decoded)
    return null
  } catch (error) {
    console.error('Error resolving keypair from input:', error)
    return null
  }
}

export const generateMnemonic = () => bip39GenerateMnemonic()

// Derives the Solana keypair for a BIP39 mnemonic. Returns null when the phrase is invalid.
export const mnemonicToKeypair = (mnemonic: string) => {
  try {
    const phrase = mnemonic.trim().toLowerCase()
    if (!phrase || !validateMnemonic(phrase)) return null
    const seed = mnemonicToSeedSync(phrase, '')
    const derivedSeed = derivePath(SOLANA_DERIVATION_PATH, seed.toString('hex')).key
    return Keypair.fromSeed(derivedSeed)
  } catch (error) {
    console.error('Error deriving keypair from mnemonic:', error)
    return null
  }
}

export const hash = (message: string) => {
  try {
    return sha256(message)
  } catch (error) {
    console.error('Error hashing message:', error)
    return ''
  }
}

export const generateNodeId = () => {
  return crypto.randomUUID().replace(/-/g, '')
}
