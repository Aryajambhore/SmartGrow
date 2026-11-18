# Darwin SmartGrow – IoT Dashboard (Milestone 2)

React + Vite + Tailwind CSS v3 + Recharts + Lucide. All data will be simulated; no real equipment is controlled.

## Run locally
Requires Node.js 18+ and PostgreSQL 14+.

    npm install
    npm run dev      # http://localhost:5173

To run the simulated dashboard only, no database setup is required.

### Backend and PostgreSQL

1. Copy `.env.example` to `.env` and update `DATABASE_URL`.
2. Create the PostgreSQL database:

       createdb darwin_smartgrow

3. Run the database migration:

       npm run db:migrate

4. Start the API:

       npm run dev:server

The API runs at `http://localhost:3001`; health is available at `GET /api/health`.

To have the frontend consume PostgreSQL-backed API data, set `VITE_DATA_MODE=live` in `.env`, restart Vite, and keep `npm run dev:server` running. The default remains `simulated`.

    npm run build    # production build

## Completed milestones
- Milestone 1: Project structure and static configuration
- Milestone 2: Responsive dashboard shell, navigation and reusable UI components
- Milestone 3: Simulation engine, monitoring pages, analytics and controls
- Milestone 4: Express REST API and PostgreSQL persistence adapter

## Structure
    src/
      config/        app settings, zone definitions, navigation
      components/
        layout/      AppShell, Sidebar, Topbar
        ui/          Card, StatCard, StatusBadge, PageHeader, EmptyState, SimulationBanner
      pages/         one file per route
      services/      DataSource contract (UI never knows if data is simulated or live)
      simulation/    sensor engine (Milestone 4, no React imports)
      hooks/ utils/  data hooks, formatters (later milestones)
