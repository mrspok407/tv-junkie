import { ThunkDispatch } from "@reduxjs/toolkit"
import { AppThunk } from "app/store"
import { FirebaseInterface } from "Components/Firebase/FirebaseContext"
import { AuthUserInterface } from "../@Types"
import { setAuthUser } from "../authUserSlice"

export const setupAuthUser =
  (authUser: AuthUserInterface["authUser"], firebase: FirebaseInterface): AppThunk =>
  async (dispatch) => {
    const _authUser = { ...authUser }
    try {
      const usernameData = await firebase.user(authUser?.uid).child("username").once("value")
      _authUser.username = usernameData.val()
    } catch (error) {
      _authUser.username = "Nameless"
    } finally {
      localStorage.setItem("authUser", JSON.stringify(_authUser))
      dispatch(setAuthUser(_authUser))
    }
  }

export default setupAuthUser
