import React, { Component } from "react"
import { HashRouter as Router, Switch, Route } from "react-router-dom"
import { compose } from "recompose"
import Profile from "Components/UserProfile/Profile"
import SearchPage from "Components/SearchPage/SearchPage"
import ShowsPage from "Components/ShowsPage/ShowsPage"
import MoviesPage from "Components/MoviesPage/MoviesPage"
import FullContentInfo from "Components/Templates/FullContentInfo/FullContentInfo"
import GridTests from "Utils/GridTests/GridTests"
import * as ROUTES from "Utils/Constants/routes"
import { WithAuthenticationProvider } from "Components/UserAuth/Session/WithAuthentication"
import { withSelectedContextProvider } from "Components/SelectedContentContext"

class App extends Component {
  render() {
    return (
      <Router basename="/">
        <div className="container">
          <Switch>
            <Route path={ROUTES.SEARCH_PAGE} exact component={SearchPage} />
            <Route path={ROUTES.SHOWS} exact component={ShowsPage} />
            <Route path={ROUTES.MOVIES} component={MoviesPage} />
            <Route path={ROUTES.FULL_CONTENT_INFO} component={FullContentInfo} />
            <Route path={ROUTES.PROFILE} component={Profile} />
            <Route path={ROUTES.GRID_TESTS} component={GridTests} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default compose(withSelectedContextProvider, WithAuthenticationProvider)(App)
