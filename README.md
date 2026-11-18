# Darwin SmartGrow

A professional, responsive IoT monitoring dashboard for a community garden irrigation pilot in Darwin, Northern Territory.

Darwin SmartGrow combines environmental monitoring, irrigation-zone management, water-use analytics, alerts and manual controls in a clean, operational interface. The project is designed for university demonstration and future integration with ESP32 sensors, LoRaWAN/MQTT and a physical irrigation system.

> [!NOTE]
> No real irrigation equipment is controlled. The default data source is a realistic in-browser sensor simulation. PostgreSQL live mode is available for persisted readings and commands.

## Key Features

- Live overview of soil moisture, temperature, humidity and tank level
- Monitoring for four independent irrigation zones
- Interactive water-consumption and moisture charts
- Alert filtering and acknowledgement
- Individual zone control and fail-safe stop-all operation
- Automatic-irrigation and watering-schedule interfaces
- Configurable zone moisture thresholds
- Sensor, notification and system settings
- Responsive desktop, tablet and mobile layout
- Swap-ready simulated and API-backed data sources

## Application Modes

| Mode | Description | Configuration |
|---|---|---|
| Simulation | Generates gradual sensor changes, irrigation cycles, alerts and disconnect scenarios | `VITE_DATA_MODE=simulated` |
| Live database | Reads zones, readings and alerts from PostgreSQL through the Express REST API | `VITE_DATA_MODE=live` |

The UI depends on the shared `DataSource` contract, so physical IoT hardware can replace the adapter without redesigning dashboard pages.

## Technology

- React 18 and Vite
- JavaScript ES modules
- Tailwind CSS
- Recharts
- Lucide React
- Express
- PostgreSQL and `pg`
- REST polling for live-dashboard updates

## Project Structure

```text
src/
├── components/
│   ├── layout/       Application shell, sidebar and topbar
│   └── ui/           Reusable cards, badges and status components
├── config/           Application and navigation configuration
├── hooks/            Shared React data subscriptions
├── pages/            Dashboard route components
├── services/         Data-source contract and implementations
├── simulation/       Pure JavaScript sensor engine
└── utils/            Formatting helpers

server/
├── index.js          Express API
├── db.js             PostgreSQL connection pool
└── migrate.js        Schema creation and seed data
```

## Quick Start

### Requirements

- Node.js 18 or newer
- PostgreSQL 14 or newer
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the environment

```bash
cp .env.example .env
```

Update `.env` as needed:

```dotenv
PORT=3001
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://postgres@localhost:5432/darwin_smartgrow
PGSSL=false
VITE_API_URL=http://localhost:3001
VITE_DATA_MODE=simulated
VITE_POLL_INTERVAL_MS=5000
```

For simulation-only development, PostgreSQL is not required.

### 3. Start the frontend

```bash
npm run dev
```

Open `http://localhost:5173`.

### 4. Start PostgreSQL live mode

Create the database:

```bash
createdb darwin_smartgrow
```

On Windows, PostgreSQL tools may require their installed `bin` directory or `psql`/`createdb` commands in `PATH`.

Apply the schema and seed the four zones:

```bash
npm run db:migrate
```

Start the API:

```bash
npm run dev:server
```

Set `VITE_DATA_MODE=live` in `.env`, restart Vite, and open the dashboard. API health is available at:

```text
http://localhost:3001/api/health
```

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | API and database health |
| `GET` | `/api/zones` | Zones and latest readings |
| `GET` | `/api/readings` | Historical sensor readings |
| `POST` | `/api/readings` | Record a sensor reading |
| `GET` | `/api/alerts` | Active and historical alerts |
| `POST` | `/api/alerts` | Create an alert |
| `PATCH` | `/api/alerts/:id/acknowledge` | Acknowledge an alert |
| `PATCH` | `/api/zones/:id` | Update thresholds or automation settings |
| `POST` | `/api/zones/:id/command` | Start, stop or configure a zone |

## Database Tables

- `zones`: Zone identity, thresholds and irrigation state
- `sensor_readings`: Moisture, environment, flow and tank readings
- `alerts`: Alert history and acknowledgement state
- `irrigation_commands`: Irrigation command audit trail

## Available Scripts

```bash
npm run dev          # Start Vite frontend
npm run dev:server   # Start Express API with file watching
npm run db:migrate   # Create and seed PostgreSQL tables
npm run build        # Create a production frontend build
npm run preview      # Preview the production build
```

## Future Hardware Integration

The next integration stage can connect ESP32 controllers and sensors through LoRaWAN or Wi-Fi, MQTT, or a REST ingestion service. Recommended additions include authenticated operators, MQTT topic subscriptions, database migrations for production, audit logging and hardware acknowledgement events.

## Security and Safe Operation

- Simulation mode never controls physical equipment
- Irrigation commands are designed as auditable API operations
- Database credentials remain in ignored `.env` files
- Threshold and command inputs are validated at API boundaries
- Production deployment should add authentication, HTTPS and role-based operator permissions

## Development Status

- Project structure and configuration
- Responsive dashboard shell and navigation
- Reusable UI components
- Sensor simulation engine
- Overview and irrigation-zone monitoring
- Water analytics and charts
- Alerts and notifications
- Irrigation controls and settings
- Express REST API
- PostgreSQL persistence adapter

## License

Add the repository license that matches your university or portfolio requirements before production use.
