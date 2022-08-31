/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import * as ROUTES from 'Utils/Constants/routes'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  isAuthThenPush?: boolean
}

const useAuthorization = ({ isAuthThenPush = false }: Props) => {
  const { authUser } = useFrequentVariables()
  const [isAuthorize, setIsAuthorize] = useState(false)

  const history = useHistory()

  useEffect(() => {
    if (authUser.uid) {
      setIsAuthorize(true)
      if (isAuthThenPush) {
        history.push(ROUTES.HOME_PAGE)
      }
    } else {
      setIsAuthorize(false)
      if (!isAuthThenPush) {
        history.push(ROUTES.HOME_PAGE)
      }
    }
  }, [authUser, setIsAuthorize, isAuthThenPush, history])

  return isAuthorize
}

export default useAuthorization
