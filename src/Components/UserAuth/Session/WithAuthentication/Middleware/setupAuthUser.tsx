import { AppThunk } from 'app/store'
import { FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import { AuthUserInterface } from '../@Types'
import { setAuthUser } from '../authUserSlice'

const setupAuthUser =
  (authUser: AuthUserInterface['authUser'], firebase: FirebaseInterface): AppThunk =>
  async (dispatch) => {
    const authUserData = { ...authUser }
    try {
      const usernameData = await firebase.user(authUser?.uid).child('username').once('value')
      authUserData.username = usernameData.val()
    } catch (error) {
      authUserData.username = 'Nameless'
    } finally {
      localStorage.setItem('authUser', JSON.stringify(authUserData))
      dispatch(setAuthUser(authUserData))
    }
  }

export default setupAuthUser
