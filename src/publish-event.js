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

import WebSocket from 'ws'

/**
 * Publishes a signed Nostr event to a relay and waits for an OK response.
 *
 * @param {string} relayUrl - WebSocket URL (e.g. wss://relay.damus.io).
 * @param {object} event - Signed Nostr event (e.g. from finalizeEvent in nostr-tools/pure).
 * @param {number} [timeoutMs=20000] - Max time to wait for OK.
 * @returns {Promise<string>} The event id.
 */
export function publishEvent (relayUrl, event, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(relayUrl)
    const timer = setTimeout(() => {
      try {
        ws.close()
      } catch (_) {}
      reject(new Error(`Relay publish timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    const finish = (err, result) => {
      clearTimeout(timer)
      try {
        ws.close()
      } catch (_) {}
      if (err) reject(err)
      else resolve(result)
    }

    ws.on('open', () => {
      ws.send(JSON.stringify(['EVENT', event]))
    })

    ws.on('message', (data) => {
      let msg
      try {
        msg = JSON.parse(data.toString())
      } catch {
        return
      }
      if (!Array.isArray(msg) || msg[0] !== 'OK') return
      if (msg[1] !== event.id) return
      if (msg[2]) finish(null, event.id)
      else finish(new Error(msg[3] || 'Relay rejected the event'))
    })

    ws.on('error', (err) => finish(err))
  })
}
