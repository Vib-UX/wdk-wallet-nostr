# wdk-wallet-nostr

[WDK](https://docs.wdk.tether.io/) wallet module for **Nostr**: BIP-39 seed, [NIP-06](https://github.com/nostr-protocol/nips/blob/master/06.md) key derivation, Schnorr signing, and publishing signed events to relays over WebSockets.

Extends [`@tetherto/wdk-wallet`](https://github.com/tetherto/wdk-wallet) (`WalletManager`, `WalletAccountReadOnly`).

## Installation

```bash
npm install wdk-wallet-nostr
```

Requires a Node-style environment with **`ws`** available (used to connect to `wss://` relays).

## Key derivation

Accounts follow **NIP-06** + SLIP-0044 coin type **1237**:

`m/44'/1237'/<account>'/0/0`

`WalletManagerNostr.getAccount(n)` uses the path suffix `n'/0/0` (so the first account is `m/44'/1237'/0'/0/0`).

## Usage

```javascript
import WalletManagerNostr from 'wdk-wallet-nostr'

const wallet = new WalletManagerNostr('your twelve word mnemonic phrase here ...', {
  relayUrl: 'wss://relay.damus.io' // default relay for publishing (optional per send)
})

const account = await wallet.getAccount(0)

// "Address" is the hex-encoded x-only secp256k1 public key (64 characters).
const pubkeyHex = await account.getAddress()

// Schnorr signature over SHA-256(UTF-8 message) — hex string
const signature = await account.sign('Hello, World!')

// Publish a signed event (kind 1 text note by default). Requires relayUrl in config or on tx.
const { hash, fee } = await account.sendTransaction({
  kind: 1,
  content: 'Hello from WDK',
  tags: [],
  relayUrl: 'wss://relay.damus.io' // optional if wallet config.relayUrl is set
})
// hash = Nostr event id; fee is always 0n (no protocol fee in this module)

wallet.dispose()
```

Also exported: `WalletAccountNostr`, `WalletAccountReadOnlyNostr`.

## Behaviour notes

| Topic | Behaviour |
| --- | --- |
| **Balance** | `getBalance()` / `getTokenBalance()` return `0n`. Nostr has no on-chain native token in this module. |
| **`sendTransaction(tx)`** | Builds and signs an event with `nostr-tools` / `finalizeEvent`, then publishes via WebSocket. `tx`: `{ kind?, content?, tags?, relayUrl? }`. |
| **`transfer()`** | Not supported; throws. |
| **`getFeeRates()`** | Returns `{ normal: 0n, fast: 0n }`. |
| **`verify()`** | On the read-only or full account; checks signatures produced by `sign()`. |

## API sketch

### `WalletManagerNostr(seed, config?)`

- **seed** — BIP-39 mnemonic string or seed bytes (`Uint8Array`).
- **config** — `relayUrl?: string`, `transferMaxFee?: bigint \| number` (reserved for API parity).

Methods: `getAccount(index?)`, `getAccountByPath(path)`, `getFeeRates()`, `dispose()` (from base manager).

### `WalletAccountNostr`

Properties: `index`, `path`, `keyPair` (`{ publicKey: Uint8Array, privateKey: Uint8Array \| null }`).

Methods: `getAddress()`, `sign()`, `verify()`, `sendTransaction(tx)`, `transfer()` (unsupported), `toReadOnlyAccount()`, `dispose()`, plus read-only helpers inherited from `WalletAccountReadOnlyNostr`.

## Development

```bash
npm install
npm test
npm run lint
```

Type definitions are published under `./types` (see `package.json` `"types"`).

**Maintainers — publish to npm:** log in (`npm login`), then for this prerelease line use `npm publish --tag beta` (required for `1.0.0-beta.x`). Consumers install with `npm install wdk-wallet-nostr@beta` until a stable `latest` release exists.

## License

Apache-2.0
