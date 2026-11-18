import 'dotenv/config'
import { pool } from './db.js'

await pool.query(`
  CREATE TABLE IF NOT EXISTS zones (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    plant VARCHAR(160) NOT NULL,
    irrigation_active BOOLEAN NOT NULL DEFAULT FALSE,
    automation_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    low_moisture_threshold NUMERIC(5,2) NOT NULL DEFAULT 40,
    high_moisture_threshold NUMERIC(5,2) NOT NULL DEFAULT 75,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    zone_id VARCHAR(32) REFERENCES zones(id),
    soil_moisture NUMERIC(5,2),
    temperature NUMERIC(5,2),
    humidity NUMERIC(5,2),
    water_flow NUMERIC(7,3),
    tank_level NUMERIC(5,2),
    connected BOOLEAN NOT NULL DEFAULT TRUE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    zone_id VARCHAR(32) REFERENCES zones(id),
    alert_type VARCHAR(32) NOT NULL,
    title VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS irrigation_commands (
    id BIGSERIAL PRIMARY KEY,
    zone_id VARCHAR(32),
    command VARCHAR(32) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(32) NOT NULL DEFAULT 'queued',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_sensor_readings_zone_time ON sensor_readings(zone_id, recorded_at DESC);
  CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);
`)

await pool.query(`
  INSERT INTO zones (id, name, plant) VALUES
    ('zone-1', 'Zone 1', 'Chillies & capsicum'),
    ('zone-2', 'Zone 2', 'Kang kong & leafy greens'),
    ('zone-3', 'Zone 3', 'Tropical herbs'),
    ('zone-4', 'Zone 4', 'Native bush foods')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO sensor_readings (zone_id, soil_moisture, temperature, humidity, water_flow, tank_level, connected)
  SELECT seed.zone_id, seed.moisture, 29.4, 68.2, 0, 76, TRUE
  FROM (VALUES
    ('zone-1'::varchar, 43::numeric),
    ('zone-2'::varchar, 61::numeric),
    ('zone-3'::varchar, 38::numeric),
    ('zone-4'::varchar, 52::numeric)
  ) AS seed(zone_id, moisture)
  WHERE NOT EXISTS (SELECT 1 FROM sensor_readings);
`)

console.log('PostgreSQL migration completed.')
await pool.end()
