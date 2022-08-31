import { AuthUserInterface } from '../@Types'

const AUTH_USER_KEY = 'authUser'

const authUserLocalHandler = () => {
  const setAuthLocal = (authUserData: AuthUserInterface['authUser']) => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUserData))
  }
  const removeAuthLocal = () => {
    localStorage.removeItem(AUTH_USER_KEY)
  }
  return { setAuthLocal, removeAuthLocal }
}

export default authUserLocalHandler
