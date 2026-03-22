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

import { schnorr } from '@noble/curves/secp256k1.js'
import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils'

/**
 * Schnorr-signs the UTF-8 message (hashed with SHA-256), matching common Nostr client semantics.
 *
 * @param {string} message - Plain text message.
 * @param {Uint8Array} secretKey - 32-byte secret key.
 * @returns {string} Hex-encoded 64-byte signature.
 */
export function signMessage (message, secretKey) {
  const hash = sha256(utf8ToBytes(message))
  return bytesToHex(schnorr.sign(hash, secretKey))
}

/**
 * Verifies a Schnorr signature produced by {@link signMessage}.
 *
 * @param {string} message - Original message.
 * @param {string} signatureHex - Hex-encoded signature.
 * @param {string} pubkeyHex - 32-byte x-only public key as 64 hex chars.
 * @returns {boolean} True if valid.
 */
export function verifyMessage (message, signatureHex, pubkeyHex) {
  const hash = sha256(utf8ToBytes(message))
  return schnorr.verify(hexToBytes(signatureHex), hash, hexToBytes(pubkeyHex))
}
