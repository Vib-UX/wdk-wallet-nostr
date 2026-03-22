export default class WalletAccountReadOnlyNostr extends WalletAccountReadOnly {
    /**
     * Creates a new nostr read-only wallet account.
     *
     * @param {string} address - The account's public key (64 hex chars).
     * @param {Omit<NostrWalletConfig, 'transferMaxFee'>} [config] - The configuration object.
     */
    constructor(address: string, config?: Omit<NostrWalletConfig, 'transferMaxFee'>);
    /**
     * The wallet account configuration.
     *
     * @protected
     * @type {Omit<NostrWalletConfig, 'transferMaxFee'>}
     */
    protected _config: Omit<NostrWalletConfig, "transferMaxFee">;
    /**
     * Verifies a message's signature.
     *
     * @param {string} message - The original message.
     * @param {string} signature - The signature to verify.
     * @returns {Promise<boolean>} True if the signature is valid.
     */
    verify(message: string, signature: string): Promise<boolean>;
    /**
     * Returns the account's native coin balance.
     *
     * @returns {Promise<bigint>} The native coin balance (in base units).
     */
    getBalance(): Promise<bigint>;
    /**
     * Returns the account balance for a specific token.
     *
     * @param {string} tokenAddress - The smart contract address of the token.
     * @returns {Promise<bigint>} The token balance (in base units).
     */
    getTokenBalance(tokenAddress: string): Promise<bigint>;
    /**
     * Quotes the costs of a send transaction operation.
     *
     * @param {NostrTransaction} tx - The transaction.
     * @returns {Promise<Omit<TransactionResult, 'hash'>>} The transaction's quotes.
     */
    quoteSendTransaction(tx: NostrTransaction): Promise<Omit<TransactionResult, "hash">>;
    /**
     * Quotes the costs of a transfer operation.
     *
     * @param {TransferOptions} options - The transfer's options.
     * @returns {Promise<Omit<TransferResult, 'hash'>>} The transfer's quotes.
     */
    quoteTransfer(options: TransferOptions): Promise<Omit<TransferResult, "hash">>;
    /**
     * Returns a transaction's receipt.
     *
     * @param {string} hash - The transaction's hash.
     * @returns {Promise<unknown | null>} The receipt, or null if the transaction has not been included in a block yet.
     */
    getTransactionReceipt(hash: string): Promise<unknown | null>;
}
export type TransactionResult = import("@tetherto/wdk-wallet").TransactionResult;
export type TransferOptions = import("@tetherto/wdk-wallet").TransferOptions;
export type TransferResult = import("@tetherto/wdk-wallet").TransferResult;
export type NostrTransaction = {
    /**
     * Nostr event kind (default 1).
     */
    kind?: number;
    /**
     * Event content.
     */
    content?: string;
    /**
     * Event tags.
     */
    tags?: string[][];
    /**
     * Relay WebSocket URL for this publish (overrides config).
     */
    relayUrl?: string;
};
export type NostrWalletConfig = {
    /**
     * Default relay URL for publishing (wss://…).
     */
    relayUrl?: string;
    /**
     * Reserved for API parity; Nostr publishing has no fee in this module.
     */
    transferMaxFee?: number | bigint;
};
import { WalletAccountReadOnly } from '@tetherto/wdk-wallet';
