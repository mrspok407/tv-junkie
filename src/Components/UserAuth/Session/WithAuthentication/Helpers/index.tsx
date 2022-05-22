import { RootState } from 'app/store'

export const getAuthUidFromState = (state: RootState) => state.authUser.authUser.uid
