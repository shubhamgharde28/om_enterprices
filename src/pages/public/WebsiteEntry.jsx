import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Home from './Home'
import WebsiteChooser from './WebsiteChooser'
import { getWebsiteSelection } from '../../services/websiteSelection'

function WebsiteEntry() {
  const [selection, setSelection] = useState(() => {
    const savedSelection = getWebsiteSelection()
    return ['water', 'solar'].includes(savedSelection) ? savedSelection : null
  })

  if (selection === 'solar') return <Navigate to="/solar" replace />
  if (!selection) return <WebsiteChooser overlay onChoose={setSelection} />

  return <Home />
}

export default WebsiteEntry
