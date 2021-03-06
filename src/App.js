import React, { Component } from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import Profile from "Components/Pages/Profile/Profile"
import Admin from "Components/Pages/Admin/Admin"
import LoginPage from "Components/Pages/Login/Login"
import SearchPage from "Components/Pages/SearchPage/SearchPage"
import HomePage from "Components/Pages/Home/Home"
import ShowsPage from "Components/Pages/Shows/Shows"
import ToWatchEpisodesPage from "Components/Pages/ToWatchEpisodes/ToWatchEpisodes"
import CalendarPage from "Components/Pages/Calendar/Calendar"
import MoviesPage from "Components/Pages/Movies/Movies"
import DetailesPage from "Components/Pages/Detailes/Detailes"
import GridTests from "Utils/GridTests/GridTests"
import * as ROUTES from "Utils/Constants/routes"
import PageNotFound from "Components/Pages/PageNotFound/PageNotFound"
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

export default AppContextHOC(App)
