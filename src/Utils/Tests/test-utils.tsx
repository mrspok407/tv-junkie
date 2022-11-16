import React, { PropsWithChildren } from 'react'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { configureStore } from '@reduxjs/toolkit'
import type { PreloadedState } from '@reduxjs/toolkit'
import { Provider as ReduxProvider } from 'react-redux'
import userShowsReducer from 'Components/UserContent/UseUserShowsRed/userShowsSliceRed'
import userMoviesReducer from 'Components/UserContent/UseUserMoviesRed/userMoviesSliceRed'
import authUserReducer from 'Components/UserAuth/Session/Authentication/authUserSlice'
import { RootState, AppStore } from 'app/store'
import Firebase from 'Components/Firebase'
import { FirebaseContext, FirebaseInterface } from 'Components/Firebase/FirebaseContext'
import ContextsWrapper from 'Components/AppContext/ContextsWrapper'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>
  store?: AppStore
  firebase?: any
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    // preloadedState = {},
    store = configureStore({
      reducer: {
        userShows: userShowsReducer,
        userMovies: userMoviesReducer,
        authUser: authUserReducer,
      },
    }),
    // firebase = new Firebase(),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  const Wrapper = ({ children }: PropsWithChildren<Record<string, unknown>>): JSX.Element => {
    return (
      <HelmetProvider>
        <ReduxProvider store={store}>
          <BrowserRouter>{children}</BrowserRouter>
          {/* <FirebaseContext.Provider value={firebase}> */}
          {/* <ContextsWrapper></ContextsWrapper> */}
          {/* </FirebaseContext.Provider> */}
        </ReduxProvider>
      </HelmetProvider>
    )
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
