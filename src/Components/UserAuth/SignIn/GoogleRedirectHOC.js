import React from "react"
import useGoogleRedirect from "./UseGoogleRedirect"

const googleRedirectHOC = (Component) => (props) => {
  useGoogleRedirect()
  return <Component {...props} />
}

export default googleRedirectHOC
