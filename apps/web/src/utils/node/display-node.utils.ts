import { PublicKey, Transaction } from '@solana/web3.js'
import bs58 from 'bs58'

const bytesToHex = (bytes: Uint8Array) => {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

const formatBytes = (bytes: Uint8Array) => {
  return {
    type: 'bytes',
    length: bytes.length,
    hex: bytesToHex(bytes),
    base64: bytesToBase64(bytes),
  }
}

const serializeTransaction = (transaction: Transaction) => {
  return {
    type: 'Transaction',
    instructionCount: transaction.instructions.length,
    feePayer: transaction.feePayer?.toBase58() ?? null,
    recentBlockhash: transaction.recentBlockhash ?? null,
    signatures: transaction.signatures.map(({ publicKey, signature }, index) => ({
      index,
      publicKey: publicKey.toBase58(),
      signature: signature ? bs58.encode(signature) : null,
    })),
    instructions: transaction.instructions.map((instruction, index) => ({
      index,
      programId: instruction.programId.toBase58(),
      accounts: instruction.keys.map((key, accountIndex) => ({
        index: accountIndex,
        pubkey: key.pubkey.toBase58(),
        isSigner: key.isSigner,
        isWritable: key.isWritable,
      })),
      data: formatBytes(instruction.data),
    })),
  }
}

const stringifyObject = (value: unknown) => {
  const seen = new WeakSet<object>()

  return JSON.stringify(
    value,
    (_key, nestedValue) => {
      if (typeof nestedValue === 'bigint') return nestedValue.toString()
      if (nestedValue instanceof PublicKey) return nestedValue.toBase58()
      if (nestedValue instanceof Transaction) return serializeTransaction(nestedValue)
      if (nestedValue instanceof Uint8Array) return formatBytes(nestedValue)

      if (typeof nestedValue === 'object' && nestedValue !== null) {
        if (seen.has(nestedValue)) return '[Circular]'
        seen.add(nestedValue)
      }

      return nestedValue
    },
    2
  )
}

export const formatDisplayValue = (value: unknown) => {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value)
  if (value instanceof PublicKey) return value.toBase58()
  if (value instanceof Transaction) return stringifyObject(serializeTransaction(value))
  if (value instanceof Uint8Array) return stringifyObject(formatBytes(value))

  try {
    return stringifyObject(value) ?? String(value)
  } catch {
    return String(value)
  }
}
