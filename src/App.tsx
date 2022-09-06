import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
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

const ContactsPage = lazy(() => import('Components/Pages/Contacts/Contacts'))

const App = () => {
  useInitializeApp()
  return (
    <Router basename="/">
      <div className="container">
        <Suspense fallback={<Loader className="loader--pink loader--lazy-load" />}>
          <Switch>
            <Route path={ROUTES.HOME_PAGE} exact component={HomePage} />
            <Route path={ROUTES.SEARCH_PAGE} exact component={SearchPage} />
            <Route path={ROUTES.SHOWS} exact component={ShowsPage} />
            <Route path={ROUTES.TO_WATCH} exact component={ToWatchEpisodesPage} />
            <Route path={ROUTES.CALENDAR} exact component={CalendarPage} />
            <Route path={ROUTES.MOVIES} exact component={MoviesPage} />
            <Route path={ROUTES.USER_PROFILE} exact component={UserProfile} />
            <Route path={ROUTES.DETAILS_PAGE} exact component={DetailsPage} />
            <Route path={ROUTES.SETTINGS} exact component={SettingsPage} />
            <Route path={ROUTES.CONTACTS_PAGE} exact component={ContactsPage} />
            <Route path={ROUTES.LOGIN_PAGE} exact component={LoginPage} />
            <Route component={PageNotFound} />
          </Switch>
          <ErrorPopupGlobal />
        </Suspense>
      </div>
    </Router>
  )
}

export default App
