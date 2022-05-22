import React from 'react'
import useGoogleRedirect from './UseGoogleRedirect'

const googleRedirectHOC = (Component) => function (props) {
  useGoogleRedirect()
  return <Component {...props} />
}

export default googleRedirectHOC
