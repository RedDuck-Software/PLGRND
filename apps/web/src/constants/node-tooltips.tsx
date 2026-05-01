import React from 'react'
import type { NodeType } from '@/types/node'
import { getNodeStyles } from '@/utils/node/node-style.utils'
import { ArrowUpRight } from 'lucide-react'
import { BoldText } from '@/components/text/bold-text'
import { HighlightedText } from '@/components/text/highlighted-text'

const NODE_TOOLTIP_LINKS: Partial<Record<NodeType, string>> = {
  NETWORK: 'https://docs.solana.com/clusters',
  KEYPAIR: 'https://solana.com/ru/developers/courses/intro-to-solana/intro-to-cryptography',
  PRIVATE_KEY: 'https://solana.com/docs/intro/dev#keypairs',
  PDA: 'https://docs.solana.com/developing/programming-model/program-derived-addresses',
  BALANCE: 'https://docs.solana.com/lamports-and-sol',
  HASH: 'https://en.wikipedia.org/wiki/Cryptographic_hash_function',
  SIGN: 'https://docs.solana.com/terminology#signature',
  VERIFY_SIGNATURE: 'https://docs.solana.com/developing/runtime-facilities/programs#ed25519-program',
  TRANSACTION_VIEW: 'https://docs.solana.com/developing/programming-model/transactions',
  TRANSACTION_BUILDER: 'https://solana.com/docs/core/transactions',
  INSTRUCTIONS: 'https://solana.com/docs/core/transactions#instructions',
  TRANSACTION: 'https://solana.com/docs/core/transactions#sending-transactions',
  IDL: 'https://solana.com/docs/programs/anchor/idl',
  PROGRAM_INSTRUCTIONS: 'https://solana.com/docs/core/cpi',
  TOKEN_BALANCE: 'https://spl.solana.com/token',
  BASE58: 'https://en.wikipedia.org/wiki/Binary-to-text_encoding#Base58',
  BASE64: 'https://en.wikipedia.org/wiki/Base64',
}

export const NODE_TOOLTIPS: Partial<Record<NodeType, React.ReactNode>> = {
  NETWORK: (
    <div>
      <p>Select the RPC cluster (Devnet, Testnet, Mainnet) and commitment level.</p>
      <p>
        Cluster controls where requests go; commitment (processed/confirmed/finalized) controls how sure a result is.
      </p>
    </div>
  ),
  KEYPAIR: (
    <>
      <p>
        A <span className="font-semibold">keypair</span> is a matching pair of{' '}
        <span className="font-semibold">public key</span> and <span className="font-semibold">secret key</span>.
      </p>
      <p>People participating in the Solana network have at least one keypair. In Solana:</p>
      <ul className="list-disc pl-4">
        <li>
          The <BoldText>public key</BoldText> is used as an “address” that points to an account on the Solana network.
          Even friendly names - like <HighlightedText>example.sol</HighlightedText> - point to addresses like{' '}
          <HighlightedText>dDCQNnDmNbFVi8cQhKAgXhyhXeJ625tvwsunRyRc7c8</HighlightedText>
        </li>
        <li>
          The <BoldText>secret key</BoldText> is used to verify authority over that keypair. If you have the secret key
          for an address, you control the tokens inside that address. For this reason, as the name suggests, you should
          always <BoldText>keep secret keys secret</BoldText>.
        </li>
      </ul>
      <p>Public key can be derived from the secret key, but not the other way around.</p>
    </>
  ),
  PRIVATE_KEY: (
    <>
      <p>
        Input a <BoldText>Private Key</BoldText> (base58 string) to control a specific account.
      </p>
      <p>This node allows you to sign transactions with a specific wallet/account.</p>
      <p className="text-destructive font-bold mt-2">
        WARNING: Never paste your mainnet private keys into untrusted applications.
      </p>
    </>
  ),
  PDA: (
    <>
      <p>
        A <BoldText>Program Derived Address</BoldText> (PDA) is an address generated from a program id and developer
        chosen <BoldText>seeds</BoldText>. It's deterministic and has <BoldText>no private key</BoldText>.
      </p>
    </>
  ),
  BALANCE: (
    <>
      <p>
        Fetch SOL balance for a provided <BoldText>public key</BoldText>.
      </p>
      <p>
        Balances are in <BoldText>lamports</BoldText> (1 SOL = 1,000,000,000 lamports).
      </p>
    </>
  ),
  HASH: (
    <>
      <p>A one-way cryptographic function that converts any input into a fixed-size unique "fingerprint".</p>
      <ul className="list-disc pl-4">
        <li>Same input → same result, every time</li>
        <li>Small change in input → a totally different result</li>
        <li>You can verify a result, but you can't "unhash" it</li>
      </ul>
      <p>Where you'll see it in Solana:</p>
      <ul className="list-disc pl-4">
        <li>Every transaction includes a recent blockhash so it's fresh and can't be replayed later.</li>
        <li>
          Program Derived Addresses - the program hashes its seeds with the program id to get a stable, program-owned
          address don't have a private key.
        </li>
      </ul>
    </>
  ),
  NUMBER: <p>Type any number you want!</p>,
  SIGN: (
    <div>
      <p>Sign bytes or transactions with a provided keypair.</p>
      <p>Signatures prove key ownership without revealing the private key; output can be verified downstream.</p>
    </div>
  ),
  VERIFY_SIGNATURE: (
    <div>
      <p>Verify a signature against a message and public key.</p>
      <p>Checks that a message was signed by the holder of the corresponding private key.</p>
    </div>
  ),
  TRANSACTION_VIEW: (
    <div>
      <p>Inspect a transaction: message, accounts, instructions, and signatures.</p>
      <p>Great for learning account metas, program ids, and instruction composition.</p>
    </div>
  ),
  TRANSACTION_BUILDER: (
    <>
      <p>
        Creates a new, empty <BoldText>Transaction</BoldText> object.
      </p>
      <p>
        Think of this as a shopping cart. You start with an empty cart, then use <BoldText>Instruction</BoldText> nodes
        to add items to it.
      </p>
    </>
  ),
  INSTRUCTIONS: (
    <>
      <p>
        Adds an <BoldText>Instruction</BoldText> to a transaction.
      </p>
      <p>An instruction is a single directive to a program, like "Transfer SOL" or "Create Account".</p>
      <p>
        Connect the transaction from a builder or another instruction node, configure the action, and pass it along.
      </p>
    </>
  ),
  TRANSACTION: (
    <>
      <p>
        The <BoldText>Sender</BoldText> node. Takes a fully built transaction and submits it to the Solana network.
      </p>
      <p>It handles the actual execution. You'll see the status directly on the node.</p>
    </>
  ),
  IDL: (
    <>
      <p>
        Loads a Solana Program's <BoldText>Interface Description Language</BoldText> (IDL).
      </p>
      <p>
        The IDL is like a menu for a program—it tells the editor what instructions (actions) are available and what
        arguments they need.
      </p>
    </>
  ),
  PROGRAM_INSTRUCTIONS: (
    <>
      <p>Interact with custom programs using their IDL.</p>
      <p>
        Once an IDL is connected, this node dynamically generates inputs for any instruction defined in that program.
      </p>
    </>
  ),
  TOKEN_BALANCE: (
    <>
      <p>
        Fetch the balance of an <BoldText>SPL token</BoldText> for a given wallet and mint address.
      </p>
      <p>
        Connect a wallet public key, a network, and the token's <BoldText>mint address</BoldText> to get the UI and raw
        balance.
      </p>
    </>
  ),
  BASE58: (
    <>
      <p>
        <BoldText>Base58</BoldText> encode or decode any string.
      </p>
      <p>
        Solana uses base58 everywhere — public keys, private keys, transaction signatures. Use this node to convert
        between raw bytes and their base58 representation.
      </p>
    </>
  ),
  BASE64: (
    <>
      <p>
        <BoldText>Base64</BoldText> encode or decode any string.
      </p>
      <p>
        Account data returned from the RPC is base64-encoded. Use this node to decode it into readable text or encode
        data for storage.
      </p>
    </>
  ),
  TEXT: <div>Type anything you want!</div>,
  DISPLAY: (
    <>
      <p>
        Render any <BoldText>upstream value</BoldText> for quick inspection.
      </p>
      <p>
        You can double click an <BoldText>output handle</BoldText> to add a <BoldText>display node</BoldText>.
      </p>
      <p>Click on text to copy it to the clipboard.</p>
    </>
  ),
}

export function getNodeTooltip(type: NodeType): React.ReactNode {
  const content = NODE_TOOLTIPS[type] ?? (
    <div>
      <p>No tooltip yet for this node.</p>
    </div>
  )

  const url = NODE_TOOLTIP_LINKS[type]
  if (!url) return content

  const { color } = getNodeStyles(type)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">{content}</div>
      <div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 underline font-medium"
          style={{ color }}
        >
          Learn more <ArrowUpRight className="size-4" />
        </a>
      </div>
    </div>
  )
}
