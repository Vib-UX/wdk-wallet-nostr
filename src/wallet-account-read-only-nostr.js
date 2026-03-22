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

import { WalletAccountReadOnly } from '@tetherto/wdk-wallet'

import { verifyMessage } from './nostr-message-sign.js'

/** @typedef {import('@tetherto/wdk-wallet').TransactionResult} TransactionResult */
/** @typedef {import('@tetherto/wdk-wallet').TransferOptions} TransferOptions */
/** @typedef {import('@tetherto/wdk-wallet').TransferResult} TransferResult */

/**
 * @typedef {Object} NostrTransaction
 * @property {number} [kind] - Nostr event kind (default: 1).
 * @property {string} [content] - Event content (default: '').
 * @property {string[][]} [tags] - Event tags (default: []).
 * @property {string} [relayUrl] - WebSocket relay URL for publishing (overrides config).
 */

/**
 * @typedef {Object} NostrWalletConfig
 * @property {string} [relayUrl] - Default relay URL for publishing events (wss://…).
 * @property {number | bigint} [transferMaxFee] - Reserved; Nostr has no on-chain fees in this module.
 */

export default class WalletAccountReadOnlyNostr extends WalletAccountReadOnly {
  /**
   * Creates a new nostr read-only wallet account.
   *
   * @param {string} address - The account's public key (64 hex chars, x-only secp256k1).
   * @param {Omit<NostrWalletConfig, 'transferMaxFee'>} [config] - The configuration object.
   */
  constructor (address, config = {}) {
    super(address)

    /**
     * The wallet account configuration.
     *
     * @protected
     * @type {Omit<NostrWalletConfig, 'transferMaxFee'>}
     */
    this._config = config
  }

  /**
   * Verifies a message's signature (Schnorr over SHA-256 of UTF-8), as produced by {@link WalletAccountNostr#sign}.
   *
   * @param {string} message - The original message.
   * @param {string} signature - The hex-encoded signature.
   * @returns {Promise<boolean>} True if the signature is valid.
   */
  async verify (message, signature) {
    const pubkeyHex = await this.getAddress()
    return verifyMessage(message, signature, pubkeyHex)
  }

  /**
   * Nostr has no native token balance; returns 0.
   *
   * @returns {Promise<bigint>} Always 0n.
   */
  async getBalance () {
    return 0n
  }

  /**
   * Nostr has no fungible token layer in this module; returns 0.
   *
   * @returns {Promise<bigint>} Always 0n.
   */
  async getTokenBalance (_tokenAddress) {
    return 0n
  }

  /**
   * Quotes the costs of publishing an event (no network fee at the protocol layer).
   *
   * @param {NostrTransaction} [_tx] - The planned event publish.
   * @returns {Promise<Omit<TransactionResult, 'hash'>>}
   */
  async quoteSendTransaction (_tx) {
    return { fee: 0n }
  }

  /**
   * Quotes transfer costs. Token transfers are not supported for Nostr in this module.
   *
   * @param {TransferOptions} [_options] - Unused.
   * @returns {Promise<Omit<TransferResult, 'hash'>>}
   */
  async quoteTransfer (_options) {
    return { fee: 0n }
  }

  /**
   * Returns a transaction receipt if available. Relays do not expose a unified receipt API; returns null.
   *
   * @param {string} _hash - Event id (hex).
   * @returns {Promise<null>}
   */
  async getTransactionReceipt (_hash) {
    return null
  }
}
