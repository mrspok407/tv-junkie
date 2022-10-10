import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const ScrollToTopOnUpdate = () => {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'PUSH') {
      window.scrollTo(0, 0)
    }
  }, [pathname, navigationType])

  return null
}

export default ScrollToTopOnUpdate
