import { useEffect } from "react"
import { useLocation, useHistory } from "react-router-dom"

export default function ScrollToTopOnUpdate() {
  const { pathname } = useLocation()
  const history = useHistory()

  useEffect(() => {
    if (history.action === "PUSH") {
      console.log("push")
      window.scrollTo(0, 0)
    }
    console.log("back button")
  }, [pathname, history.action])

  return null
}
