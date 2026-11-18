/**
 * Data source contract. The UI depends only on this shape, never on where
 * the data comes from. Milestone 4 adds a simulated implementation; later a
 * live one (REST + WebSocket/MQTT bridge) can replace it with no UI changes.
 *
 * @typedef {Object} DataSource
 * @property {'simulated'|'live'} mode
 * @property {() => Promise<Object>} getSnapshot       latest readings for all zones + environment
 * @property {(cb: (snapshot: Object) => void) => () => void} subscribe  returns unsubscribe fn
 * @property {(zoneId: string, command: Object) => Promise<void>} sendCommand
 */
export {}
