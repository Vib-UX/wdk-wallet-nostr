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

import * as bip39 from 'bip39'

import WalletAccountReadOnlyNostr from './wallet-account-read-only-nostr.js'

/** @typedef {import('@tetherto/wdk-wallet').IWalletAccount} IWalletAccount */

/** @typedef {import('@tetherto/wdk-wallet').KeyPair} KeyPair */
/** @typedef {import('@tetherto/wdk-wallet').TransactionResult} TransactionResult */
/** @typedef {import('@tetherto/wdk-wallet').TransferOptions} TransferOptions */
/** @typedef {import('@tetherto/wdk-wallet').TransferResult} TransferResult */

/** @typedef {import('./wallet-account-read-only-nostr.js').NostrTransaction} NostrTransaction */
/** @typedef {import('./wallet-account-read-only-nostr.js').NostrWalletConfig} NostrWalletConfig */

// TODO: Update BIP-44 coin type for blockchain nostr
// See: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
const BIP_44_DERIVATION_PATH_PREFIX = "m/44'/0'"

/** @implements {IWalletAccount} */
export default class WalletAccountNostr extends WalletAccountReadOnlyNostr {
  /**
   * Creates a new nostr wallet account.
   *
   * @private
   * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed.
   * @param {string} path - The BIP-44 derivation path (e.g. "0'/0/0").
   * @param {NostrWalletConfig} [config] - The configuration object.
   */
  constructor (seed, path, config = {}) {
    // TODO: Derive the account's address and pass it to the super constructor.
    //       If the address derivation requires async operations, use undefined
    //       instead and then override the 'getAddress(): Promise<string>' method
    //       to derive and return it.
    super(address, config)

    /**
     * The wallet account configuration.
     *
     * @protected
     * @type {NostrWalletConfig}
     */
    this._config = config
  }

  /**
   * Creates a new nostr wallet account.
   *
   * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed.
   * @param {string} path - The BIP-44 derivation path (e.g. "0'/0/0").
   * @param {NostrWalletConfig} [config] - The configuration object.
   * @returns {Promise<WalletAccountNostr>} The wallet account.
   */
  static async at (seed, path, config = {}) {
    const account = new WalletAccountNostr(seed, path, config)

    return account
  }

  /**
   * The derivation path's index of this account.
   *
   * @type {number}
   */
  get index () {
    // TODO: Return the proper index for the account
  }

  /**
   * The derivation path of this account.
   *
   * @type {string}
   */
  get path () {
    // TODO: Return the proper path for the account
  }

  /**
   * The account's key pair.
   *
   * @type {KeyPair}
   */
  get keyPair () {
    // TODO: Return the proper key pair for the account
  }

  /**
   * Signs a message.
   *
   * @param {string} message - The message to sign.
   * @returns {Promise<string>} The message's signature.
   */
  async sign (message) {
    // TODO: Implement blockchain-specific message signing
  }

  /**
   * Sends a transaction.
   *
   * @param {NostrTransaction} tx - The transaction.
   * @returns {Promise<TransactionResult>} The transaction's result.
   */
  async sendTransaction (tx) {
    // TODO: Implement blockchain-specific transaction sending
  }

  /**
   * Transfers a token to another address.
   *
   * @param {TransferOptions} options - The transfer's options.
   * @returns {Promise<TransferResult>} The transfer's result.
   */
  async transfer (options) {
    // TODO: Implement blockchain-specific token transfer
  }

  /**
   * Returns a read-only copy of the account.
   *
   * @returns {Promise<WalletAccountReadOnlyNostr>} The read-only account.
   */
  async toReadOnlyAccount () {
    // TODO: Implement conversion to read-only account
  }

  /**
   * Disposes the wallet account, erasing the private key from the memory.
   */
  dispose () {
    // TODO: Implement disposal of sensitive data e.g., the private key
  }
}
