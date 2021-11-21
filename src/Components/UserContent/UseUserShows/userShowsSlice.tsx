import { createSlice, PayloadAction, current } from "@reduxjs/toolkit"
import { RootState } from "app/store"
import { SnapshotVal } from "Components/AppContext/@Types"
import sortDataSnapshot from "./FirebaseHelpers/sortDataSnapshot"
import { UserShowsInterface } from "./UseUserShows"

interface UserShowsState {
  data: {
    [key: string]: UserShowsInterface
  }
  initialLoading: boolean | string
}

const initialState: UserShowsState = {
  data: {},
  initialLoading: true
}

export const testSlice = createSlice({
  name: "test",
  initialState: { test: "" },
  reducers: {
    testRed: (state, action: PayloadAction<string>) => {
      state.test = action.payload
    }
  }
})

export const counterSlice = createSlice({
  name: "userShows",
  initialState,
  reducers: {
    updateUserShows: {
      reducer(state, action: PayloadAction<UserShowsState["data"]>) {
        state.data = action.payload
        // state.initialLoading = false
      },
      prepare(data: any) {
        // Тут в аррай переделать
        // Так же тут, возможно, делать sortDataSnapshot из снапшота. Чтобы сортировка была. А в санке ниже снапшот отправлять
        data["opachki"] = "opa"
        return {
          payload: data
        }
      }
    },
    addNewShow: (state, action: PayloadAction<UserShowsInterface>) => {
      state.data[action.payload.id] = action.payload
    },
    updateInitialLoading: (state, action: PayloadAction<UserShowsState["initialLoading"]>) => {
      state.initialLoading = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(testSlice.actions.testRed, (state, action) => {
      state.initialLoading = action.payload

      console.log({ state: current(state), action })
    })
  }
})

export const { updateUserShows, addNewShow, updateInitialLoading } = counterSlice.actions

export const fetchUserShows = (id: any, firebase: any) => async (dispatch: any, getState: any) => {
  try {
    // make an async call in the thunk
    const userShowsSnapshot = await firebase.userAllShows(id).orderByChild("timeStamp").once("value")
    // Тут полную инфу получать сириков и объединять

    // dispatch an action when we get the response back
    //dispatch({ type: "userShows/updateUserShows", payload: userShowsSnapshot.val() })

    dispatch(updateUserShows(Object.values(userShowsSnapshot.val())))
    console.log({ getState: getState() })
  } catch (err) {
    dispatch(updateInitialLoading(false))
    // If something went wrong, handle it here
  }
}

export const selectUserShows = (state: RootState) => state.userShows

export default counterSlice.reducer
