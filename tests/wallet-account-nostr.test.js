// Copyright 2026 Vib-UX &lt;vibhav@instaraise.io&gt;
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Structure aligned with https://github.com/tetherto/wdk-wallet-solana/blob/main/tests/wallet-account-solana.test.js

'use strict'

import * as bip39 from 'bip39'

import { describe, it, expect, beforeAll, jest } from '@jest/globals'

/** NIP-06 test vector — https://github.com/nostr-protocol/nips/blob/master/06.md */
const NIP06_MNEMONIC = 'leader monkey parrot ring guide accident before fence cannon height naive bean'
const NIP06_PUBKEY_HEX = '17162c921dc4d2518f9a101db33695df1afb56ab82f5ff3e5da6eec3ca5cd917'
const NIP06_SECKEY_HEX = '7f7ff03d123792d6ac594bfa67bf6d0c0ab55b6b1fdb6249303fe861f1ccba9a'

const TEST_SEED_PHRASE = 'test walk nut penalty hip pave soap entry language right filter choice'

/** @type {typeof import('../src/wallet-account-nostr.js').default} */
let WalletAccountNostr

/** @type {typeof import('../src/wallet-manager-nostr.js').default} */
let WalletManagerNostr

describe('WalletAccountNostr', () => {
  beforeAll(async () => {
    jest.resetModules()
    await jest.unstable_mockModule('../src/publish-event.js', () => ({
      publishEvent: jest.fn(async (_url, event) => event.id)
    }))
    ;({ default: WalletAccountNostr } = await import('../src/wallet-account-nostr.js'))
    ;({ default: WalletManagerNostr } = await import('../src/wallet-manager-nostr.js'))
  })

  describe('derivation (NIP-06)', () => {
    it('should derive the NIP-06 test vector public key at m/44\'/1237\'/0\'/0/0', async () => {
      const seed = bip39.mnemonicToSeedSync(NIP06_MNEMONIC)
      const account = await WalletAccountNostr.at(seed, "0'/0/0", {})
      expect(await account.getAddress()).toBe(NIP06_PUBKEY_HEX)
      expect(account.path).toBe("m/44'/1237'/0'/0/0")
      expect(account.index).toBe(0)
      account.dispose()
    })

    it('should reject invalid mnemonic', async () => {
      await expect(
        WalletAccountNostr.at(
          'invalid word that does not exist test test test test test test test',
          "0'/0/0",
          {}
        )
      ).rejects.toThrow('The seed phrase is invalid.')
    })
  })

  describe('keyPair', () => {
    it('should expose secp256k1 x-only keys consistent with NIP-06', async () => {
      const account = await WalletAccountNostr.at(
        bip39.mnemonicToSeedSync(NIP06_MNEMONIC),
        "0'/0/0",
        {}
      )
      const { publicKey, privateKey } = account.keyPair
      expect(Buffer.from(publicKey).toString('hex')).toBe(NIP06_PUBKEY_HEX)
      expect(Buffer.from(privateKey).toString('hex')).toBe(NIP06_SECKEY_HEX)
      account.dispose()
    })
  })

  describe('sign / verify', () => {
    it('should sign and verify a message', async () => {
      const account = await WalletAccountNostr.at(
        bip39.mnemonicToSeedSync(NIP06_MNEMONIC),
        "0'/0/0",
        {}
      )
      const sig = await account.sign('hello')
      await expect(account.verify('hello', sig)).resolves.toBe(true)
      await expect(account.verify('wrong', sig)).resolves.toBe(false)
      account.dispose()
    })
  })

  describe('sendTransaction', () => {
    it('should finalize and publish an event (publishEvent mocked)', async () => {
      const account = await WalletAccountNostr.at(
        bip39.mnemonicToSeedSync(NIP06_MNEMONIC),
        "0'/0/0",
        { relayUrl: 'wss://relay.example.com' }
      )
      const result = await account.sendTransaction({
        kind: 1,
        content: 'unit test'
      })
      expect(result.fee).toBe(0n)
      expect(result.hash).toMatch(/^[a-f0-9]{64}$/)
      account.dispose()
    })

    it('should throw if no relay URL is configured', async () => {
      const account = await WalletAccountNostr.at(
        bip39.mnemonicToSeedSync(NIP06_MNEMONIC),
        "0'/0/0",
        {}
      )
      await expect(account.sendTransaction({ kind: 1, content: 'x' })).rejects.toThrow(/relay URL is required/)
      account.dispose()
    })

    it('should allow relay URL on the transaction object', async () => {
      const account = await WalletAccountNostr.at(
        bip39.mnemonicToSeedSync(NIP06_MNEMONIC),
        "0'/0/0",
        {}
      )
      const result = await account.sendTransaction({
        kind: 1,
        content: 'x',
        relayUrl: 'wss://relay.example.com'
      })
      expect(result.hash).toMatch(/^[a-f0-9]{64}$/)
      account.dispose()
    })
  })

  describe('transfer', () => {
    it('should throw (not supported)', async () => {
      const account = await WalletAccountNostr.at(
        bip39.mnemonicToSeedSync(NIP06_MNEMONIC),
        "0'/0/0",
        {}
      )
      await expect(
        account.transfer({ token: 'x', recipient: 'y', amount: 1n })
      ).rejects.toThrow('Token transfers are not supported')
      account.dispose()
    })
  })

  describe('toReadOnlyAccount', () => {
    it('should return a read-only account with the same pubkey', async () => {
      const account = await WalletAccountNostr.at(
        bip39.mnemonicToSeedSync(NIP06_MNEMONIC),
        "0'/0/0",
        {}
      )
      const ro = await account.toReadOnlyAccount()
      expect(await ro.getAddress()).toBe(await account.getAddress())
      account.dispose()
    })
  })

  describe('dispose', () => {
    it('should clear key material', async () => {
      const wm = new WalletManagerNostr(TEST_SEED_PHRASE, {})
      const account = await wm.getAccount(0)
      expect(account.keyPair.privateKey).toBeInstanceOf(Uint8Array)
      account.dispose()
      expect(account.keyPair.privateKey).toBeNull()
    })
  })
})
