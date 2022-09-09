/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as ROUTES from 'Utils/Constants/routes'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'

type Props = {
  isAuthThenPush?: boolean
}

const useAuthorization = ({ isAuthThenPush = false }: Props) => {
  const { authUser } = useFrequentVariables()
  const [isAuthorize, setIsAuthorize] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (authUser.uid) {
      setIsAuthorize(true)
      if (isAuthThenPush) {
        navigate(ROUTES.HOME_PAGE)
      }
    } else {
      setIsAuthorize(false)
      if (!isAuthThenPush) {
        navigate(ROUTES.HOME_PAGE)
      }
    }
  }, [authUser, setIsAuthorize, isAuthThenPush, navigate])

  return isAuthorize
}

export default useAuthorization
