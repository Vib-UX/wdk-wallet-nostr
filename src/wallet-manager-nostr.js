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

import WalletManager from '@tetherto/wdk-wallet'

import WalletAccountNostr from './wallet-account-nostr.js'

/** @typedef {import('@tetherto/wdk-wallet').FeeRates} FeeRates */

/** @typedef {import('./wallet-account-read-only-nostr.js').NostrWalletConfig} NostrWalletConfig */

export default class WalletManagerNostr extends WalletManager {
  /**
   * Creates a new wallet manager for the nostr blockchain.
   *
   * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed.
   * @param {NostrWalletConfig} [config] - The configuration object.
   */
  constructor (seed, config = {}) {
    super(seed, config)

    /**
     * The nostr wallet configuration.
     *
     * @protected
     * @type {NostrWalletConfig}
     */
    this._config = config
  }

  /**
   * Returns the wallet account at a specific index (see [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)).
   *
   * @param {number} [index] - The index of the account to get (default: 0).
   * @returns {Promise<WalletAccountNostr>} The account.
   */
  async getAccount (index = 0) {
    // NIP-06: m/44'/1237'/<account>'/0/0 — see wallet-account-nostr.js
    const account = await this.getAccountByPath(`${index}'/0/0`)

    return account
  }

  /**
   * Returns the wallet account at a specific BIP-44 derivation path.
   *
   * @param {string} path - The derivation path (e.g. "0'/0/0").
   * @returns {Promise<WalletAccountNostr>} The account.
   */
  async getAccountByPath (path) {
    if (!this._accounts[path]) {
      const account = await WalletAccountNostr.at(this.seed, path, this._config)

      this._accounts[path] = account
    }

    return this._accounts[path]
  }

  /**
   * Returns the current fee rates.
   *
   * @returns {Promise<FeeRates>} The fee rates (in base units).
   */
  async getFeeRates () {
    return {
      normal: 0n,
      fast: 0n
    }
  }
}
