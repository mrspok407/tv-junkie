import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { AuthUserInterface } from '../@Types'
import { setAuthUser } from '../authUserSlice'
import authUserLocalHandler from '../LocalStorageHandler/authUserLocalHandler'

const setupAuthUser =
  (authUser: AuthUserInterface['authUser'], firebase: FirebaseInterface): AppThunk =>
  async (dispatch) => {
    const authUserData = { ...authUser }
    const { setAuthLocal } = authUserLocalHandler()
    try {
      const usernameData = await firebase.user(authUser?.uid).child('username').once('value')
      authUserData.username = usernameData.val()
    } catch (error) {
      authUserData.username = 'Nameless'
    } finally {
      setAuthLocal(authUserData)
      dispatch(setAuthUser(authUserData))
    }
  }

export default setupAuthUser
