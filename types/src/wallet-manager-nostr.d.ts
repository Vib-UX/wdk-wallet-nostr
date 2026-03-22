export default class WalletManagerNostr extends WalletManager {
    /**
     * Creates a new wallet manager for the nostr blockchain.
     *
     * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed phrase.
   * @param {NostrWalletConfig} [config] - The configuration object.
     */
    constructor(seed: string | Uint8Array, config?: NostrWalletConfig);
    /**
     * The nostr wallet configuration. 
     *
     * @protected
     * @type {NostrWalletConfig}
     */
    protected _config: NostrWalletConfig;
    /**
     * Returns the wallet account at a specific index (see [BIP-44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)).
     *
     * @param {number} [index] - The index of the account to get (default: 0).
     * @returns {Promise<WalletAccountNostr>} The account.
     */
    getAccount(index?: number): Promise<WalletAccountNostr>;
    /**
     * Returns the wallet account at a specific BIP-44 derivation path.
     *
     * @param {string} path - The derivation path (e.g. "0'/0/0").
     * @returns {Promise<WalletAccountNostr>} The account.
     */
    getAccountByPath(path: string): Promise<WalletAccountNostr>;
    /**
     * Returns the current fee rates.
     *
     * @returns {Promise<FeeRates>} The fee rates (in base units).
     */
    getFeeRates(): Promise<FeeRates>;
}
export type FeeRates = import("@tetherto/wdk-wallet").FeeRates;
export type NostrWalletConfig = import("./wallet-account-read-only-nostr.js").NostrWalletConfig;
import WalletManager from '@tetherto/wdk-wallet';
import WalletAccountNostr from './wallet-account-nostr.js';
