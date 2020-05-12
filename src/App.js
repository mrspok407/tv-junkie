import React, { Component } from "react"
import { HashRouter as Router, Switch, Route } from "react-router-dom"
import { compose } from "recompose"
import SearchPage from "./Components/SearchPage/SearchPage"
import ShowsPage from "./Components/ShowsPage/ShowsPage"
import MoviesPage from "./Components/MoviesPage/MoviesPage"
import FullContentInfo from "./Components/Templates/FullContentInfo/FullContentInfo"
import GridTests from "./Utils/GridTests/GridTests"
import Profile from "./Components/UserProfile/Profile"
import { WithAuthenticationProvider } from "./Components/UserAuth/Session"
import { withSelectedContextProvider } from "./Components/SelectedContentContext"

class App extends Component {
  render() {
    return (
      <Router basename="/">
        <div className="container">
          <Switch>
            <Route path="/" exact component={SearchPage} />
            <Route path="/shows" exact component={ShowsPage} />
            <Route path="/:mediaType/:id" component={FullContentInfo} />
            <Route path="/movies" component={MoviesPage} />
            <Route path="/profile" component={Profile} />
            <Route path="/grid-tests" component={GridTests} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default compose(withSelectedContextProvider, WithAuthenticationProvider)(App)
