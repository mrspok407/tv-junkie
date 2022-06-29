import React from 'react'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import SettingsPage from 'Components/Pages/Settings/SettingsPage'
import LoginPage from 'Components/Pages/Login/LoginPage'
import SearchPage from 'Components/Pages/SearchPage/SearchPage'
import HomePage from 'Components/Pages/Home/Home'
import ShowsPage from 'Components/Pages/Shows/Shows'
import ToWatchEpisodesPage from 'Components/Pages/ToWatchEpisodes/ToWatchEpisodes'
import CalendarPage from 'Components/Pages/Calendar/Calendar'
import MoviesPage from 'Components/Pages/Movies/Movies'
import DetailesPage from 'Components/Pages/Detailes/Detailes'
import UserProfile from 'Components/Pages/UserProfile/UserProfile'
import * as ROUTES from 'Utils/Constants/routes'
import PageNotFound from 'Components/Pages/PageNotFound/PageNotFound'
import AppContextHOC from 'Components/AppContext/AppContextHOC'
import ContactsPage from 'Components/Pages/Contacts/Contacts'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import CreatePortal from 'Components/UI/Modal/CreatePortal'
import ModalContent from 'Components/UI/Modal/ModalContent'

const App = () => {
  const { errors } = useFrequentVariables()
  console.log('App Rerender')
  return (
    <Router basename="/">
      <div className="container">
        <Switch>
          <Route path={ROUTES.HOME_PAGE} exact component={HomePage} />
          <Route path={ROUTES.SEARCH_PAGE} exact component={SearchPage} />
          <Route path={ROUTES.SHOWS} exact component={ShowsPage} />
          <Route path={ROUTES.TO_WATCH} exact component={ToWatchEpisodesPage} />
          <Route path={ROUTES.CALENDAR} exact component={CalendarPage} />
          <Route path={ROUTES.MOVIES} exact component={MoviesPage} />
          <Route path={ROUTES.USER_PROFILE} exact component={UserProfile} />
          <Route path={ROUTES.DETAILES_PAGE} exact component={DetailesPage} />
          <Route path={ROUTES.SETTINGS} exact component={SettingsPage} />
          <Route path={ROUTES.CONTACTS_PAGE} exact component={ContactsPage} />
          <Route path={ROUTES.LOGIN_PAGE} exact component={LoginPage} />
          <Route component={PageNotFound} />
        </Switch>
        {errors.error && <CreatePortal element={<ModalContent message={errors.error.message} />} />}
      </div>
    </Router>
  )
}

// export default AppContextHOC(App)
export default App
