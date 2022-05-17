import { AppThunk } from "app/store"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { AuthUserInterface } from "../@Types"
import { setAuthUser } from "../authUserSlice"

export const setupAuthUser =
  (authUser: AuthUserInterface["authUser"], firebase: FirebaseInterface): AppThunk =>
  async (dispatch) => {
    try {
      const username = await firebase.user(authUser?.uid).child("username").once("value")
      authUser.username = username.val() || "Nameless"
      localStorage.setItem("authUser", JSON.stringify(authUser))
      dispatch(setAuthUser(authUser))
      console.log({ setAuthUser: true, authUser })
      return Promise.resolve()
    } catch (error) {}
  }

export default setupAuthUser
