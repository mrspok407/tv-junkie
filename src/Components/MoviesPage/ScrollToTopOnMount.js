import { useEffect } from "react"

export default function ScrollToTopOnMount() {
  useEffect(() => {
    console.log("test")
    window.scrollTo(0, 0)
  }, [])

  return null
}
