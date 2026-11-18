// Static application configuration. Contains NO sensor readings.
export const APP_NAME = 'Darwin SmartGrow'
export const APP_VERSION = '0.4.0'
export const SITE = { name: 'Community Garden Pilot', location: 'Darwin, NT, Australia' }

// 'simulated' now; 'live' once the Node/MQTT backend exists.
export const DATA_MODE = 'simulated'

export const ZONES = [
  { id: 'zone-1', name: 'Zone 1', plant: 'Chillies & capsicum' },
  { id: 'zone-2', name: 'Zone 2', plant: 'Kang kong & leafy greens' },
  { id: 'zone-3', name: 'Zone 3', plant: 'Tropical herbs' },
  { id: 'zone-4', name: 'Zone 4', plant: 'Native bush foods' },
]
