import { ZONES } from '../config/app.js'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const round = (value, digits = 1) => Number(value.toFixed(digits))

export function createSimulationEngine({ intervalMs = 5000 } = {}) {
  let timer = null
  let tick = 0

  const state = {
    timestamp: new Date().toISOString(),
    environment: { temperature: 29.4, humidity: 68.2 },
    tankLevel: 76,
    waterUsedToday: 284,
    systemStatus: 'Healthy',
    automationEnabled: true,
    zones: ZONES.map((zone, index) => ({
      ...zone,
      moisture: [43, 61, 38, 52][index],
      flow: 0,
      irrigating: false,
      connected: true,
      lastUpdated: new Date().toISOString(),
      thresholdLow: 40,
      thresholdHigh: 75,
    })),
    history: Array.from({ length: 24 }, (_, index) => ({
      hour: `${String(index).padStart(2, '0')}:00`,
      water: [8, 6, 5, 4, 4, 7, 12, 18, 22, 16, 13, 15, 19, 17, 14, 12, 16, 21, 26, 24, 19, 15, 11, 9][index],
      moisture: [52, 51, 50, 49, 48, 47, 46, 45, 44, 43, 42, 41, 44, 47, 50, 52, 54, 56, 58, 57, 55, 54, 53, 52][index],
    })),
    alerts: [
      { id: 'alert-1', type: 'warning', title: 'Low moisture detected', message: 'Zone 3 soil moisture is approaching the low threshold.', zoneId: 'zone-3', timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), acknowledged: false },
      { id: 'alert-2', type: 'info', title: 'Irrigation completed', message: 'Zone 2 irrigation cycle completed successfully.', zoneId: 'zone-2', timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString(), acknowledged: true },
    ],
  }

  const subscribers = new Set()

  function snapshot() {
    return structuredClone(state)
  }

  function notify() {
    const value = snapshot()
    subscribers.forEach((callback) => callback(value))
  }

  function updateAlerts() {
    const generated = []

    if (state.tankLevel <= 20) {
      generated.push({ id: 'tank-low', type: 'critical', title: 'Low tank level', message: `Water tank has reached ${Math.round(state.tankLevel)}%.`, timestamp: new Date().toISOString(), acknowledged: false })
    }

    state.zones.forEach((zone) => {
      if (!zone.connected) {
        generated.push({ id: `${zone.id}-offline`, type: 'critical', title: 'Sensor disconnected', message: `${zone.name} is not reporting sensor data.`, zoneId: zone.id, timestamp: new Date().toISOString(), acknowledged: false })
      } else if (zone.moisture < zone.thresholdLow) {
        generated.push({ id: `${zone.id}-low`, type: 'warning', title: 'Low soil moisture', message: `${zone.name} moisture is ${Math.round(zone.moisture)}%.`, zoneId: zone.id, timestamp: new Date().toISOString(), acknowledged: false })
      } else if (zone.moisture > zone.thresholdHigh) {
        generated.push({ id: `${zone.id}-high`, type: 'warning', title: 'High soil moisture', message: `${zone.name} moisture is ${Math.round(zone.moisture)}%.`, zoneId: zone.id, timestamp: new Date().toISOString(), acknowledged: false })
      }
    })

    const manualAlerts = state.alerts.filter((alert) => ['alert-1', 'alert-2'].includes(alert.id))
    state.alerts = [...generated, ...manualAlerts].filter((alert, index, list) => list.findIndex((item) => item.id === alert.id) === index)
  }

  function advance() {
    tick += 1
    state.timestamp = new Date().toISOString()

    state.environment.temperature = round(clamp(state.environment.temperature + (Math.random() - 0.48) * 0.3, 24, 36))
    state.environment.humidity = round(clamp(state.environment.humidity + (Math.random() - 0.5) * 0.5, 45, 85))

    state.zones = state.zones.map((zone) => {
      if (!zone.connected) return { ...zone, flow: 0, irrigating: false, lastUpdated: zone.lastUpdated }

      let moisture = zone.moisture
      let flow = zone.irrigating ? 2.8 + Math.random() * 0.8 : 0

      if (zone.irrigating) {
        moisture += 0.9 + Math.random() * 0.8
        state.waterUsedToday += flow * intervalMs / 60000
        state.tankLevel -= 0.018
        if (moisture >= zone.thresholdHigh) {
          flow = 0
          moisture = zone.thresholdHigh
          zone.irrigating = false
        }
      } else {
        moisture -= 0.08 + Math.random() * 0.12
      }

      return {
        ...zone,
        moisture: round(clamp(moisture, 5, 95)),
        flow: round(flow),
        irrigating: zone.irrigating,
        lastUpdated: state.timestamp,
      }
    })

    if (state.automationEnabled) {
      state.zones = state.zones.map((zone) => {
        if (zone.connected && !zone.irrigating && zone.moisture < zone.thresholdLow) {
          return { ...zone, irrigating: true, flow: round(2.8 + Math.random() * 0.8) }
        }
        return zone
      })
    }

    state.tankLevel = round(clamp(state.tankLevel, 0, 100))
    state.waterUsedToday = round(state.waterUsedToday)

    const disconnected = tick % 90 === 0
    if (disconnected) {
      const zone = state.zones[tick % state.zones.length]
      zone.connected = false
      setTimeout(() => { zone.connected = true; notify() }, 30000)
    }

    updateAlerts()

    const latest = state.history[state.history.length - 1]
    state.history = [...state.history.slice(1), {
      hour: new Date(state.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      water: round(latest.water + (Math.random() - 0.5) * 3),
      moisture: round(state.zones.reduce((sum, zone) => sum + zone.moisture, 0) / state.zones.length),
    }]

    state.systemStatus = state.zones.every((zone) => zone.connected) && state.tankLevel > 10 ? 'Healthy' : 'Attention required'
    notify()
  }

  async function getSnapshot() {
    return snapshot()
  }

  function subscribe(callback) {
    subscribers.add(callback)
    callback(snapshot())
    if (!timer) timer = setInterval(advance, intervalMs)
    return () => {
      subscribers.delete(callback)
      if (subscribers.size === 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }
  }

  async function sendCommand(zoneId, command = {}) {
    if (command.automation !== undefined) {
      state.automationEnabled = Boolean(command.automation)
    }

    if (zoneId === '*') {
      state.zones = state.zones.map((zone) => ({ ...zone, irrigating: Boolean(command.irrigating), flow: command.irrigating ? 3 : 0 }))
    } else {
      const zone = state.zones.find((item) => item.id === zoneId)
      if (!zone) throw new Error(`Unknown zone: ${zoneId}`)

      if (command.irrigating !== undefined) {
        zone.irrigating = Boolean(command.irrigating)
        zone.flow = zone.irrigating ? 3 : 0
      }
      if (command.thresholdLow !== undefined) zone.thresholdLow = clamp(Number(command.thresholdLow), 10, 80)
      if (command.thresholdHigh !== undefined) zone.thresholdHigh = clamp(Number(command.thresholdHigh), 20, 90)
    }

    state.timestamp = new Date().toISOString()
    updateAlerts()
    notify()
  }

  return { mode: 'simulated', getSnapshot, subscribe, sendCommand }
}
