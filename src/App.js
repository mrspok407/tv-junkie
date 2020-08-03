import React, { Component } from "react"
import { HashRouter as Router, Switch, Route } from "react-router-dom"
import { compose } from "recompose"
import Profile from "Components/UserProfile/Profile"
import Admin from "Components/Admin/Admin"
import LoginPage from "Components/LoginPage/LoginPage"
import SearchPage from "Components/SearchPage/SearchPage"
import HomePage from "Components/HomePage/HomePage"
import ShowsPage from "Components/ShowsPage/ShowsPage"
import ToWatchEpisodesPage from "Components/ToWatchEpisodesPage/ToWatchEpisodesPage"
import CalendarPage from "Components/CalendarPage/CalendarPage"
import MoviesPage from "Components/MoviesPage/MoviesPage"
import FullContentInfo from "Components/Templates/FullContentInfo/FullContentInfo"
import GridTests from "Utils/GridTests/GridTests"
import * as ROUTES from "Utils/Constants/routes"
import { WithAuthenticationProvider } from "Components/UserAuth/Session/WithAuthentication"
import userContentLocalStorageProvider from "Components/UserContent/UserContentLocalStorageContext"

class App extends Component {
  render() {
    return (
      <Router basename="/">
        <div className="container">
          <Switch>
            <Route path={ROUTES.HOME_PAGE} exact component={HomePage} />
            <Route path={ROUTES.SEARCH_PAGE} exact component={SearchPage} />
            <Route path={ROUTES.SHOWS} exact component={ShowsPage} />
            <Route path={ROUTES.TO_WATCH} component={ToWatchEpisodesPage} />
            <Route path={ROUTES.CALENDAR} component={CalendarPage} />
            <Route path={ROUTES.MOVIES} component={MoviesPage} />
            <Route path={ROUTES.FULL_CONTENT_INFO} component={FullContentInfo} />
            <Route path={ROUTES.PROFILE} component={Profile} />
            <Route path={ROUTES.LOGIN_PAGE} component={LoginPage} />
            <Route path={ROUTES.ADMIN} component={Admin} />
            <Route path={ROUTES.GRID_TESTS} component={GridTests} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default compose(WithAuthenticationProvider, userContentLocalStorageProvider)(App)
