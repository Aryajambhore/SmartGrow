import { LayoutDashboard, Sprout, ChartLine, Bell, Droplets, Settings } from 'lucide-react'
import OverviewPage from '../pages/OverviewPage.jsx'
import ZonesPage from '../pages/ZonesPage.jsx'
import AnalyticsPage from '../pages/AnalyticsPage.jsx'
import AlertsPage from '../pages/AlertsPage.jsx'
import ControlsPage from '../pages/ControlsPage.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'

export const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard, element: OverviewPage },
  { path: '/zones', label: 'Irrigation zones', icon: Sprout, element: ZonesPage },
  { path: '/analytics', label: 'Water analytics', icon: ChartLine, element: AnalyticsPage },
  { path: '/alerts', label: 'Alerts', icon: Bell, element: AlertsPage },
  { path: '/controls', label: 'Irrigation controls', icon: Droplets, element: ControlsPage },
  { path: '/settings', label: 'Settings', icon: Settings, element: SettingsPage },
]
