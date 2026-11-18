import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { pool, query } from './db.js'

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({ status: 'healthy', database: 'connected', timestamp: new Date().toISOString() })
  } catch (error) {
    response.status(503).json({ status: 'unhealthy', database: 'disconnected', error: error.message })
  }
})

app.get('/api/zones', async (_request, response, next) => {
  try {
    const result = await query(`
      SELECT z.*, r.soil_moisture, r.temperature, r.humidity, r.water_flow,
             r.tank_level, r.connected, r.recorded_at
      FROM zones z
      LEFT JOIN LATERAL (
        SELECT * FROM sensor_readings
        WHERE zone_id = z.id
        ORDER BY recorded_at DESC
        LIMIT 1
      ) r ON true
      ORDER BY z.id
    `)
    response.json(result.rows)
  } catch (error) { next(error) }
})

app.get('/api/readings', async (request, response, next) => {
  try {
    const zoneId = request.query.zone
    const limit = Math.min(Number(request.query.limit || 24), 1000)
    const result = zoneId
      ? await query('SELECT * FROM sensor_readings WHERE zone_id = $1 ORDER BY recorded_at DESC LIMIT $2', [zoneId, limit])
      : await query('SELECT * FROM sensor_readings ORDER BY recorded_at DESC LIMIT $1', [limit])
    response.json(result.rows.reverse())
  } catch (error) { next(error) }
})

app.post('/api/readings', async (request, response, next) => {
  try {
    const { zoneId, soilMoisture, temperature, humidity, waterFlow, tankLevel, connected = true } = request.body
    if (!zoneId || soilMoisture == null) return response.status(400).json({ error: 'zoneId and soilMoisture are required' })

    const result = await query(`
      INSERT INTO sensor_readings (zone_id, soil_moisture, temperature, humidity, water_flow, tank_level, connected)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [zoneId, soilMoisture, temperature, humidity, waterFlow, tankLevel, connected])

    await query('UPDATE zones SET updated_at = NOW() WHERE id = $1', [zoneId])
    response.status(201).json(result.rows[0])
  } catch (error) { next(error) }
})

app.get('/api/alerts', async (_request, response, next) => {
  try {
    const result = await query('SELECT * FROM alerts ORDER BY created_at DESC LIMIT 200')
    response.json(result.rows)
  } catch (error) { next(error) }
})

app.post('/api/alerts', async (request, response, next) => {
  try {
    const { zoneId, alertType, title, message } = request.body
    if (!alertType || !title || !message) return response.status(400).json({ error: 'alertType, title and message are required' })

    const result = await query(`
      INSERT INTO alerts (zone_id, alert_type, title, message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [zoneId || null, alertType, title, message])
    response.status(201).json(result.rows[0])
  } catch (error) { next(error) }
})

app.patch('/api/alerts/:id/acknowledge', async (request, response, next) => {
  try {
    const id = Number(request.params.id)
    if (!Number.isInteger(id)) return response.status(400).json({ error: 'Invalid alert id' })

    const result = await query(`
      UPDATE alerts SET acknowledged = TRUE, acknowledged_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id])
    if (result.rowCount === 0) return response.status(404).json({ error: 'Alert not found' })
    response.json(result.rows[0])
  } catch (error) { next(error) }
})

app.patch('/api/zones/:id', async (request, response, next) => {
  try {
    const { irrigationActive, automationEnabled, lowMoistureThreshold, highMoistureThreshold } = request.body
    const values = {
      irrigation_active: irrigationActive,
      automation_enabled: automationEnabled,
      low_moisture_threshold: lowMoistureThreshold,
      high_moisture_threshold: highMoistureThreshold,
    }
    const entries = Object.entries(values).filter(([, value]) => value !== undefined)
    if (entries.length === 0) return response.status(400).json({ error: 'No supported settings provided' })

    const assignments = entries.map(([key], index) => `${key} = $${index + 2}`).join(', ')
    const result = await query(`UPDATE zones SET ${assignments}, updated_at = NOW() WHERE id = $1 RETURNING *`, [request.params.id, ...entries.map(([, value]) => value)])
    if (result.rowCount === 0) return response.status(404).json({ error: 'Zone not found' })

    await query('INSERT INTO irrigation_commands (zone_id, command, payload, status) VALUES ($1, $2, $3, $4)', [request.params.id, 'configure', request.body, 'accepted'])
    response.json(result.rows[0])
  } catch (error) { next(error) }
})

app.post('/api/zones/:id/command', async (request, response, next) => {
  try {
    const supported = new Set(['start', 'stop', 'enable-auto', 'disable-auto'])
    const { command } = request.body
    if (!supported.has(command)) return response.status(400).json({ error: 'Unsupported command' })

    const irrigationActive = command === 'start'
    const automationEnabled = command === 'enable-auto' ? true : command === 'disable-auto' ? false : undefined

    await query('INSERT INTO irrigation_commands (zone_id, command, payload, status) VALUES ($1, $2, $3, $4)', [request.params.id, command, request.body, 'accepted'])

    const updates = []
    const values = [request.params.id]
    if (automationEnabled !== undefined) {
      updates.push(`automation_enabled = $${values.length + 1}`)
      values.push(automationEnabled)
    } else {
      updates.push(`irrigation_active = $${values.length + 1}`)
      values.push(irrigationActive)
    }

    const result = await query(`UPDATE zones SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $1 RETURNING *`, values)
    if (result.rowCount === 0) return response.status(404).json({ error: 'Zone not found' })
    response.json(result.rows[0])
  } catch (error) { next(error) }
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ error: 'Internal server error' })
})

app.listen(port, () => {
  console.log(`Darwin SmartGrow API listening on http://localhost:${port}`)
})
