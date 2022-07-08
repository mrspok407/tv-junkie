import { AppThunk } from 'app/store'
import { LocalStorageContentInt } from 'Components/AppContext/Contexts/LocalStorageContentContext/@Types'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { AuthUserInterface } from '../@Types'
import { setAuthUser } from '../authUserSlice'
import authUserLocalHandler from '../LocalStorageHandler/authUserLocalHandler'

type Args = {
  authUser: AuthUserInterface['authUser']
  firebase: FirebaseInterface
  localStorageHandlers: LocalStorageContentInt['handlers']
}

const setupAuthUser =
  ({ authUser, firebase, localStorageHandlers }: Args): AppThunk =>
  async (dispatch) => {
    const authUserData = { ...authUser }
    const { setAuthLocal } = authUserLocalHandler()
    try {
      const usernameData = await firebase.user(authUser?.uid).child('username').once('value')
      authUserData.username = usernameData.val()
    } catch (error) {
      authUserData.username = 'Nameless'
    } finally {
      localStorageHandlers.clearLocalStorageContent()
      setAuthLocal(authUserData)
      dispatch(setAuthUser(authUserData))
    }
  }

export default setupAuthUser
