import { useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'

const ScrollToTopOnUpdate = () => {
  const { pathname } = useLocation()
  const history = useHistory()

  useEffect(() => {
    if (history.action === 'PUSH') {
      window.scrollTo(0, 0)
    }
  }, [pathname, history.action])

  return null
}

export default ScrollToTopOnUpdate
