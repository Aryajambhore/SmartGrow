import { useEffect, useState } from 'react'

export function useDataSource(dataSource) {
  const [snapshot, setSnapshot] = useState(null)

  useEffect(() => {
    let active = true

    dataSource.getSnapshot().then((value) => {
      if (active) setSnapshot(value)
    })

    const unsubscribe = dataSource.subscribe((value) => {
      if (active) setSnapshot(value)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [dataSource])

  return snapshot
}
