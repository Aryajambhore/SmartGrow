import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import PageHeader from '../components/ui/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import { useDataSource } from '../hooks/useDataSource.js'
import { dataSource } from '../services/activeDataSource.js'

const tooltipStyle = { borderRadius: 8, border: '1px solid #E1E7DF', boxShadow: '0 4px 12px rgba(20,33,26,.08)', fontSize: 12 }

export default function AnalyticsPage() {
  const snapshot = useDataSource(dataSource)
  if (!snapshot) return null

  const zoneComparison = snapshot.zones.map((zone) => ({ name: zone.name.replace('Zone ', 'Z'), moisture: Math.round(zone.moisture), flow: zone.flow }))

  return (
    <>
      <PageHeader title="Water analytics" description="Consumption and soil moisture trends across the garden." />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card title="Hourly water consumption" className="xl:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshot.history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs><linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1F6F9C" stopOpacity={0.22} /><stop offset="95%" stopColor="#1F6F9C" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#EDF1EC" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#7B897F' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7B897F' }} tickLine={false} axisLine={false} unit=" L" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="water" name="Water used" stroke="#1F6F9C" fill="url(#waterFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Zone moisture">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneComparison} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
                <CartesianGrid stroke="#EDF1EC" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7B897F' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7B897F' }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="moisture" name="Moisture" fill="#2F8F5B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Average soil moisture trend" className="xl:col-span-3">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={snapshot.history} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#EDF1EC" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#7B897F' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#7B897F' }} tickLine={false} axisLine={false} unit="%" domain={[20, 80]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="moisture" name="Average moisture" stroke="#267A4C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  )
}
