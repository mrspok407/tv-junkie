import React from 'react'
import useGoogleRedirect from './UseGoogleRedirect'

const googleRedirectHOC = (Component: any) =>
  function (props: any) {
    useGoogleRedirect()
    return <Component {...props} />
  }

export default googleRedirectHOC
