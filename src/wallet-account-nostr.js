// Copyright 2026 Vib-UX &lt;vibhav@instaraise.io&gt;
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict'

import { HDKey } from '@scure/bip32'
import * as bip39 from 'bip39'
import { finalizeEvent, getPublicKey } from 'nostr-tools/pure'
import { hexToBytes } from '@noble/hashes/utils'

import WalletAccountReadOnlyNostr from './wallet-account-read-only-nostr.js'

import { publishEvent } from './publish-event.js'
import { signMessage } from './nostr-message-sign.js'

/** @typedef {import('@tetherto/wdk-wallet').IWalletAccount} IWalletAccount */

/** @typedef {import('@tetherto/wdk-wallet').KeyPair} KeyPair */
/** @typedef {import('@tetherto/wdk-wallet').TransactionResult} TransactionResult */
/** @typedef {import('@tetherto/wdk-wallet').TransferOptions} TransferOptions */
/** @typedef {import('@tetherto/wdk-wallet').TransferResult} TransferResult */

/** @typedef {import('./wallet-account-read-only-nostr.js').NostrTransaction} NostrTransaction */
/** @typedef {import('./wallet-account-read-only-nostr.js').NostrWalletConfig} NostrWalletConfig */

/**
 * [NIP-06](https://github.com/nostr-protocol/nips/blob/master/06.md) + SLIP-0044 coin type 1237.
 *
 * @see https://github.com/satoshilabs/slips/blob/master/slip-0044.md
 */
const BIP_44_NOSTR_DERIVATION_PATH_PREFIX = "m/44'/1237'"

/** @implements {IWalletAccount} */
export default class WalletAccountNostr extends WalletAccountReadOnlyNostr {
  /**
   * @private
   * @param {string | Uint8Array} seed - BIP-39 seed bytes or mnemonic string.
   * @param {string} path - Path suffix (e.g. "0'/0/0").
   * @param {NostrWalletConfig} [config] - Configuration.
   */
  constructor (seed, path, config = {}) {
    if (typeof seed === 'string') {
      if (!bip39.validateMnemonic(seed)) {
        throw new Error('The seed phrase is invalid.')
      }
      seed = bip39.mnemonicToSeedSync(seed)
    }

    super(undefined, config)

    /**
     * @protected
     * @type {NostrWalletConfig}
     */
    this._config = config

    /** @private @type {Uint8Array | undefined} */
    this._seed = seed

    /** @private @type {string} */
    this._path = `${BIP_44_NOSTR_DERIVATION_PATH_PREFIX}/${path}`

    /** @private @type {Uint8Array | undefined} */
    this._rawPrivateKey = undefined

    /** @private @type {Uint8Array | undefined} */
    this._rawPublicKey = undefined

    /** @private @type {string | undefined} */
    this._pubkeyHex = undefined
  }

  /**
   * @param {string | Uint8Array} seed - BIP-39 seed or mnemonic.
   * @param {string} path - Path suffix (e.g. "0'/0/0").
   * @param {NostrWalletConfig} [config] - Configuration.
   * @returns {Promise<WalletAccountNostr>}
   */
  static async at (seed, path, config = {}) {
    const account = new WalletAccountNostr(seed, path, config)

    const hdKey = HDKey.fromMasterSeed(account._seed)
    const derived = hdKey.derive(account._path)

    if (!derived.privateKey) {
      throw new Error('Failed to derive a private key for this path.')
    }

    const sk = new Uint8Array(derived.privateKey)
    account._rawPrivateKey = sk
    account._pubkeyHex = getPublicKey(sk)
    account._rawPublicKey = hexToBytes(account._pubkeyHex)

    return account
  }

  /**
   * @type {number}
   */
  get index () {
    const segments = this._path.split('/')
    return parseInt(segments[3].replace("'", ''), 10)
  }

  /**
   * Full BIP-32 path (e.g. m/44'/1237'/0'/0/0).
   *
   * @type {string}
   */
  get path () {
    return this._path
  }

  /**
   * @type {KeyPair}
   */
  get keyPair () {
    return {
      privateKey: this._rawPrivateKey ?? null,
      publicKey: this._rawPublicKey
    }
  }

  /**
   * @returns {Promise<string>} Hex-encoded x-only public key (64 chars).
   */
  async getAddress () {
    if (!this._pubkeyHex) {
      throw new Error("The account's address must be set to perform this operation.")
    }
    return this._pubkeyHex
  }

  /**
   * @param {string} message - UTF-8 message.
   * @returns {Promise<string>} Hex-encoded Schnorr signature.
   */
  async sign (message) {
    if (!this._rawPrivateKey) {
      throw new Error('The wallet account has been disposed.')
    }
    return signMessage(message, this._rawPrivateKey)
  }

  /**
   * Builds, signs, and publishes a Nostr event to a relay WebSocket.
   *
   * @param {NostrTransaction} tx - Event fields and optional relay override.
   * @returns {Promise<TransactionResult>} Event id as `hash`, `fee` 0.
   */
  async sendTransaction (tx) {
    if (!this._rawPrivateKey) {
      throw new Error('The wallet account has been disposed.')
    }

    const relayUrl = tx.relayUrl ?? this._config.relayUrl
    if (!relayUrl) {
      throw new Error(
        'A relay URL is required to publish. Set config.relayUrl or tx.relayUrl (e.g. wss://relay.damus.io).'
      )
    }

    const eventTemplate = {
      kind: tx.kind ?? 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: tx.tags ?? [],
      content: tx.content ?? ''
    }

    const event = finalizeEvent(eventTemplate, this._rawPrivateKey)
    await publishEvent(relayUrl, event)

    return { hash: event.id, fee: 0n }
  }

  /**
   * Nostr has no generic token transfer in this module.
   *
   * @param {TransferOptions} _options - Unused.
   * @returns {Promise<TransferResult>}
   */
  async transfer (_options) {
    throw new Error('Token transfers are not supported for the Nostr wallet module.')
  }

  /**
   * @returns {Promise<WalletAccountReadOnlyNostr>}
   */
  async toReadOnlyAccount () {
    const address = await this.getAddress()
    return new WalletAccountReadOnlyNostr(address, this._config)
  }

  dispose () {
    if (this._rawPrivateKey) {
      this._rawPrivateKey.fill(0)
      this._rawPrivateKey = undefined
    }
    this._rawPublicKey = undefined
    this._pubkeyHex = undefined
    this._seed = undefined
  }
}
