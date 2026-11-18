const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || `API request failed with status ${response.status}`)
  }

  return response.json()
}

export function createLiveDataSource() {
  let timer = null

  function average(values) {
    const connected = values.filter((value) => value != null)
    return connected.length ? connected.reduce((sum, value) => sum + Number(value), 0) / connected.length : 0
  }

  async function getSnapshot() {
    const [zones, readings, alerts] = await Promise.all([
      request('/api/zones'),
      request('/api/readings?limit=24'),
      request('/api/alerts'),
    ])

    const zoneValues = zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      plant: zone.plant,
      moisture: Number(zone.soil_moisture || 0),
      temperature: Number(zone.temperature || 0),
      flow: Number(zone.water_flow || 0),
      irrigating: Boolean(zone.irrigation_active),
      connected: zone.connected == null ? true : Boolean(zone.connected),
      automationEnabled: Boolean(zone.automation_enabled),
      thresholdLow: Number(zone.low_moisture_threshold),
      thresholdHigh: Number(zone.high_moisture_threshold),
      lastUpdated: zone.recorded_at || zone.updated_at,
    }))

    const byHour = readings.reduce((groups, reading) => {
      const date = new Date(reading.recorded_at)
      const hour = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      if (!groups[hour]) groups[hour] = { hour, water: 0, moisture: [] }
      groups[hour].water += Number(reading.water_flow || 0)
      if (reading.soil_moisture != null) groups[hour].moisture.push(Number(reading.soil_moisture))
      return groups
    }, {})

    const history = Object.values(byHour).map((group) => ({
      hour: group.hour,
      water: Number(group.water.toFixed(1)),
      moisture: Number(average(group.moisture).toFixed(1)),
    }))

    const latest = readings[0] || {}
    const timestamp = latest.recorded_at || new Date().toISOString()

    return {
      timestamp,
      environment: {
        temperature: Number(latest.temperature || average(zoneValues.map((zone) => zone.temperature))),
        humidity: Number(latest.humidity || 0),
      },
      tankLevel: Number(latest.tank_level || 0),
      waterUsedToday: readings.reduce((sum, reading) => sum + Number(reading.water_flow || 0), 0),
      systemStatus: zoneValues.some((zone) => !zone.connected) ? 'Attention required' : 'Healthy',
      automationEnabled: zoneValues.every((zone) => zone.automation_enabled),
      zones: zoneValues,
      history,
      alerts: alerts.map((alert) => ({
        id: `alert-${alert.id}`,
        type: alert.alert_type,
        title: alert.title,
        message: alert.message,
        zoneId: alert.zone_id,
        timestamp: alert.created_at,
        acknowledged: Boolean(alert.acknowledged),
      })),
    }
  }

  function subscribe(callback) {
    callbackPromise(callback)
    timer = setInterval(() => callbackPromise(callback), Number(import.meta.env.VITE_POLL_INTERVAL_MS || 5000))
    return () => {
      if (timer) clearInterval(timer)
      timer = null
    }
  }

  async function callbackPromise(callback) {
    try {
      callback(await getSnapshot())
    } catch (error) {
      console.error('Live data source unavailable:', error)
    }
  }

  async function sendCommand(zoneId, command = {}) {
    if (command.irrigating !== undefined) {
      await request(`/api/zones/${encodeURIComponent(zoneId)}/command`, {
        method: 'POST',
        body: JSON.stringify({ command: command.irrigating ? 'start' : 'stop' }),
      })
    }

    if (command.automation !== undefined) {
      await request(`/api/zones/${encodeURIComponent(zoneId)}/command`, {
        method: 'POST',
        body: JSON.stringify({ command: command.automation ? 'enable-auto' : 'disable-auto' }),
      })
    }

    if (command.thresholdLow !== undefined || command.thresholdHigh !== undefined) {
      await request(`/api/zones/${encodeURIComponent(zoneId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          lowMoistureThreshold: command.thresholdLow,
          highMoistureThreshold: command.thresholdHigh,
        }),
      })
    }
  }

  return { mode: 'live', getSnapshot, subscribe, sendCommand }
}
