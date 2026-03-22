/** @implements {IWalletAccount} */
export default class WalletAccountNostr extends WalletAccountReadOnlyNostr implements IWalletAccount {
    /**
     * Creates a new nostr wallet account.
     *
     * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed.
     * @param {string} path - The BIP-44 derivation path (e.g. "0'/0/0").
     * @param {NostrWalletConfig} [config] - The configuration object.
     * @returns {Promise<WalletAccountNostr>} The wallet account.
     */
    static at(seed: string | Uint8Array, path: string, config?: NostrWalletConfig): Promise<WalletAccountNostr>;
    /**
     * Creates a new nostr wallet account.
     *
     * @private
     * @param {string | Uint8Array} seed - The wallet's [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) seed.
     * @param {string} path - The BIP-44 derivation path (e.g. "0'/0/0").
     * @param {NostrWalletConfig} [config] - The configuration object.
     */
    private constructor(seed: string | Uint8Array, path: string, config?: NostrWalletConfig);
    /**
     * The derivation path's index of this account.
     *
     * @type {number}
     */
    get index(): number;
    /**
     * The derivation path of this account.
     *
     * @type {string}
     */
    get path(): string;
    /**
     * The account's key pair.
     *
     * @type {KeyPair}
     */
    get keyPair(): KeyPair;
    /**
     * Signs a message.
     *
     * @param {string} message - The message to sign.
     * @returns {Promise<string>} The message's signature.
     */
    sign(message: string): Promise<string>;
    /**
     * Sends a transaction.
     *
     * @param {NostrTransaction} tx - The transaction.
     * @returns {Promise<TransactionResult>} The transaction's result.
     */
    sendTransaction(tx: NostrTransaction): Promise<TransactionResult>;
    /**
     * Transfers a token to another address.
     *
     * @param {TransferOptions} options - The transfer's options.
     * @returns {Promise<TransferResult>} The transfer's result.
     */
    transfer(options: TransferOptions): Promise<TransferResult>;
    /**
     * Returns a read-only copy of the account.
     *
     * @returns {Promise<WalletAccountReadOnlyNostr>} The read-only account.
     */
    toReadOnlyAccount(): Promise<WalletAccountReadOnlyNostr>;
    /**
     * Disposes the wallet account, erasing the private key from the memory.
     */
    dispose(): void;
}
export type IWalletAccount = import("@tetherto/wdk-wallet").IWalletAccount;
export type KeyPair = import("@tetherto/wdk-wallet").KeyPair;
export type TransactionResult = import("@tetherto/wdk-wallet").TransactionResult;
export type TransferOptions = import("@tetherto/wdk-wallet").TransferOptions;
export type TransferResult = import("@tetherto/wdk-wallet").TransferResult;
export type NostrTransaction = import("./wallet-account-read-only-nostr.js").NostrTransaction;
export type NostrWalletConfig = import("./wallet-account-read-only-nostr.js").NostrWalletConfig;
import WalletAccountReadOnlyNostr from './wallet-account-read-only-nostr.js';
