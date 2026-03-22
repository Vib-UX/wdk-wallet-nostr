// Copyright 2026 Vib-UX &lt;vibhav@instaraise.io&gt;
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Pattern aligned with https://github.com/tetherto/wdk-wallet/blob/main/tests/wallet-account-read-only.test.js

'use strict'

import { describe, it, expect } from '@jest/globals'

import WalletAccountReadOnlyNostr from '../src/wallet-account-read-only-nostr.js'

import { signMessage } from '../src/nostr-message-sign.js'

/** NIP-06 vector public key */
const PUBKEY_HEX = '17162c921dc4d2518f9a101db33695df1afb56ab82f5ff3e5da6eec3ca5cd917'

/** Secret key from NIP-06 vector (for signing test messages only). */
const NIP06_SECKEY_HEX = '7f7ff03d123792d6ac594bfa67bf6d0c0ab55b6b1fdb6249303fe861f1ccba9a'

describe('WalletAccountReadOnlyNostr', () => {
  describe('getAddress', () => {
    it('should return the hex pubkey', async () => {
      const account = new WalletAccountReadOnlyNostr(PUBKEY_HEX)
      const address = await account.getAddress()
      expect(address).toBe(PUBKEY_HEX)
    })

    it('should throw if the address is not set', async () => {
      const account = new WalletAccountReadOnlyNostr()

      await expect(account.getAddress())
        .rejects.toThrow("The account's address must be set to perform this operation.")
    })
  })

  describe('verify', () => {
    it('should return true for a valid signature', async () => {
      const account = new WalletAccountReadOnlyNostr(PUBKEY_HEX)
      const sk = new Uint8Array(Buffer.from(NIP06_SECKEY_HEX, 'hex'))
      const sig = signMessage('hello nostr', sk)
      await expect(account.verify('hello nostr', sig)).resolves.toBe(true)
    })

    it('should return false for a wrong message', async () => {
      const account = new WalletAccountReadOnlyNostr(PUBKEY_HEX)
      const sk = new Uint8Array(Buffer.from(NIP06_SECKEY_HEX, 'hex'))
      const sig = signMessage('hello nostr', sk)
      await expect(account.verify('other message', sig)).resolves.toBe(false)
    })
  })

  describe('getBalance / getTokenBalance', () => {
    it('should return 0n for native balance', async () => {
      const account = new WalletAccountReadOnlyNostr(PUBKEY_HEX)
      await expect(account.getBalance()).resolves.toBe(0n)
    })

    it('should return 0n for token balance', async () => {
      const account = new WalletAccountReadOnlyNostr(PUBKEY_HEX)
      await expect(account.getTokenBalance('any')).resolves.toBe(0n)
    })
  })

  describe('quoteSendTransaction / quoteTransfer', () => {
    it('should quote zero fee for publish', async () => {
      const account = new WalletAccountReadOnlyNostr(PUBKEY_HEX)
      await expect(account.quoteSendTransaction({ kind: 1, content: 'x' })).resolves.toEqual({ fee: 0n })
    })

    it('should quote zero fee for transfer', async () => {
      const account = new WalletAccountReadOnlyNostr(PUBKEY_HEX)
      await expect(account.quoteTransfer({ token: 'x', recipient: 'y', amount: 1 })).resolves.toEqual({ fee: 0n })
    })
  })

  describe('getTransactionReceipt', () => {
    it('should return null', async () => {
      const account = new WalletAccountReadOnlyNostr(PUBKEY_HEX)
      await expect(account.getTransactionReceipt('abc')).resolves.toBeNull()
    })
  })
})
