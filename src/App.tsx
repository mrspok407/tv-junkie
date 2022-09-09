import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SettingsPage from 'Components/Pages/Settings/SettingsPage'
import LoginPage from 'Components/Pages/Login/LoginPage'
import SearchPage from 'Components/Pages/SearchPage/SearchPage'
import HomePage from 'Components/Pages/Home/Home'
import ShowsPage from 'Components/Pages/Shows/Shows'
import ToWatchEpisodesPage from 'Components/Pages/ToWatchEpisodes/ToWatchEpisodes'
import CalendarPage from 'Components/Pages/Calendar/Calendar'
import MoviesPage from 'Components/Pages/Movies/Movies'
import DetailsPage from 'Components/Pages/Details/Details'
import UserProfile from 'Components/Pages/UserProfile/UserProfile'
import * as ROUTES from 'Utils/Constants/routes'
import PageNotFound from 'Components/Pages/PageNotFound/PageNotFound'
import useInitializeApp from 'Components/UserContent/UseUserShowsRed/UseInitializeApp'
import ErrorPopupGlobal from 'Components/UI/ErrorPopupGlobal/ErrorPopupGlobal'
import Loader from 'Components/UI/Placeholders/Loader'
import { GoogleRedirectWrapper } from 'Components/UserAuth/SignIn/UseGoogleRedirect'

const ContactsPage = lazy(() => import('Components/Pages/Contacts/Contacts'))

const App = () => {
  useInitializeApp()

  return (
    <Router basename="/">
      <div className="container">
        <GoogleRedirectWrapper>
          <Suspense fallback={<Loader className="loader--pink loader--lazy-load" />}>
            <Routes>
              <Route path={ROUTES.HOME_PAGE} element={<HomePage />} />
              <Route path={ROUTES.SEARCH_PAGE} element={<SearchPage />} />
              <Route path={ROUTES.SHOWS} element={<ShowsPage />} />
              <Route path={ROUTES.TO_WATCH} element={<ToWatchEpisodesPage />} />
              <Route path={ROUTES.CALENDAR} element={<CalendarPage />} />
              <Route path={ROUTES.MOVIES} element={<MoviesPage />} />
              <Route path={ROUTES.USER_PROFILE} element={<UserProfile />} />
              <Route path={ROUTES.DETAILS_PAGE} element={<DetailsPage />} />
              <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
              <Route path={ROUTES.CONTACTS_PAGE} element={<ContactsPage />} />
              <Route path={ROUTES.LOGIN_PAGE} element={<LoginPage />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
            <ErrorPopupGlobal />
          </Suspense>
        </GoogleRedirectWrapper>
      </div>
    </Router>
  )
}

export default App
