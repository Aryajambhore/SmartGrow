import { dataSource as simulationDataSource } from './simulationDataSource.js'
import { createLiveDataSource } from './liveDataSource.js'

const mode = import.meta.env.VITE_DATA_MODE || 'simulated'

export const dataSource = mode === 'live' ? createLiveDataSource() : simulationDataSource
