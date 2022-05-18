import { RootState } from "app/store"

export const getAuthUidFromState = (state: RootState) => {
  return state.authUser.authUser.uid
}
