import React, { Component } from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import { compose } from "recompose"
import Profile from "Components/UserProfile/Profile"
import Admin from "Components/AdminPage/Admin"
import LoginPage from "Components/LoginPage/LoginPage"
import SearchPage from "Components/SearchPage/SearchPage"
import HomePage from "Components/HomePage/HomePage"
import ShowsPage from "Components/ShowsPage/ShowsPage"
import ToWatchEpisodesPage from "Components/ToWatchEpisodesPage/ToWatchEpisodesPage"
import CalendarPage from "Components/CalendarPage/CalendarPage"
import MoviesPage from "Components/MoviesPage/MoviesPage"
import DetailesPage from "Components/DetailesPage/DetailesPage"
import GridTests from "Utils/GridTests/GridTests"
import * as ROUTES from "Utils/Constants/routes"
import { WithAuthenticationProvider } from "Components/UserAuth/Session/WithAuthentication"
import PageNotFound from "Components/PageNotFound/PageNotFound"
import AppContextHOC from "Components/AppContext/AppContextHOC"

class App extends Component {
  render() {
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
            <Route path={ROUTES.DETAILES_PAGE} exact component={DetailesPage} />
            <Route path={ROUTES.PROFILE} exact component={Profile} />
            <Route path={ROUTES.LOGIN_PAGE} exact component={LoginPage} />
            <Route path={ROUTES.ADMIN} exact component={Admin} />
            <Route path={ROUTES.GRID_TESTS} exact component={GridTests} />
            <Route component={PageNotFound} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default compose(WithAuthenticationProvider, AppContextHOC)(App)
