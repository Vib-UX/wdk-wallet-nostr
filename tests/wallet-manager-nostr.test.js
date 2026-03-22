// Copyright 2026 Vib-UX &lt;vibhav@instaraise.io&gt;
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Structure aligned with https://github.com/tetherto/wdk-wallet-solana/blob/main/tests/wallet-manager-solana.test.js

'use strict'

import * as bip39 from 'bip39'

import { describe, it, expect, beforeEach } from '@jest/globals'

import WalletManagerNostr from '../src/wallet-manager-nostr.js'
import WalletAccountNostr from '../src/wallet-account-nostr.js'

const TEST_SEED_PHRASE = 'test walk nut penalty hip pave soap entry language right filter choice'

/** NIP-06 test vector — https://github.com/nostr-protocol/nips/blob/master/06.md */
const NIP06_MNEMONIC = 'leader monkey parrot ring guide accident before fence cannon height naive bean'
const NIP06_ACCOUNT0_PUBKEY_HEX = '17162c921dc4d2518f9a101db33695df1afb56ab82f5ff3e5da6eec3ca5cd917'

describe('WalletManagerNostr', () => {
  let wallet

  beforeEach(() => {
    wallet = new WalletManagerNostr(TEST_SEED_PHRASE, {})
  })

  describe('Constructor', () => {
    it('should create wallet manager with empty config', () => {
      expect(wallet).toBeInstanceOf(WalletManagerNostr)
      expect(wallet._config).toEqual({})
    })

    it('should create wallet manager with string seed phrase', () => {
      const w = new WalletManagerNostr(TEST_SEED_PHRASE, { relayUrl: 'wss://relay.example.com' })
      expect(w).toBeInstanceOf(WalletManagerNostr)
      expect(w._config.relayUrl).toBe('wss://relay.example.com')
    })
  })

  describe('getAccount', () => {
    it('should return account at index 0 with NIP-06-style path', async () => {
      const w = new WalletManagerNostr(bip39.mnemonicToSeedSync(NIP06_MNEMONIC), {})
      const account = await w.getAccount(0)
      expect(account).toBeInstanceOf(WalletAccountNostr)
      expect(account.index).toBe(0)
      expect(account.path).toBe("m/44'/1237'/0'/0/0")
      expect(await account.getAddress()).toBe(NIP06_ACCOUNT0_PUBKEY_HEX)
    })

    it('should return different accounts for different indices', async () => {
      const account0 = await wallet.getAccount(0)
      const account1 = await wallet.getAccount(1)
      expect(account0).not.toBe(account1)
      expect(await account0.getAddress()).not.toBe(await account1.getAddress())
    })

    it('should handle large index numbers', async () => {
      const account = await wallet.getAccount(999)
      expect(account.index).toBe(999)
      expect(account.path).toBe("m/44'/1237'/999'/0/0")
    })
  })

  describe('getAccountByPath', () => {
    it('should return account for path "0\'/0/0"', async () => {
      const account = await wallet.getAccountByPath("0'/0/0")
      expect(account).toBeInstanceOf(WalletAccountNostr)
      expect(account.path).toBe("m/44'/1237'/0'/0/0")
    })

    it('should return the same instance when called twice with the same path', async () => {
      const a = await wallet.getAccountByPath("0'/0/0")
      const b = await wallet.getAccountByPath("0'/0/0")
      expect(a).toBe(b)
    })

    it('should return different accounts for different paths', async () => {
      const account1 = await wallet.getAccountByPath("0'/0/0")
      const account2 = await wallet.getAccountByPath("0'/0/1")
      expect(account1).not.toBe(account2)
      expect(await account1.getAddress()).not.toBe(await account2.getAddress())
    })
  })

  describe('getFeeRates', () => {
    it('should return zero fee rates', async () => {
      const feeRates = await wallet.getFeeRates()
      expect(feeRates.normal).toBe(0n)
      expect(feeRates.fast).toBe(0n)
    })
  })
})
