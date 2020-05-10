import React, { Component } from "react"
import { HashRouter as Router, Switch, Route } from "react-router-dom"
import SearchPage from "./Components/SearchPage/SearchPage"
import ShowsPage from "./Components/ShowsPage/ShowsPage"
import MoviesPage from "./Components/MoviesPage/MoviesPage"
import FullContentInfo from "./Components/Templates/FullContentInfo/FullContentInfo"
import GridTests from "./Utils/GridTests/GridTests"
import { SelectedContentContext } from "./Components/Context/SelectedContentContext"

const LOCAL_STORAGE_KEY_CONTENT = "selectedContent"

export default class App extends Component {
  constructor(props) {
    super(props)

    this.toggleContent = (id, contentArr) => {
      const newSelectedContent = [...this.state.selectedContent]
      const indexInSelected = newSelectedContent.findIndex(e => e.id === id)

      if (indexInSelected !== -1) {
        newSelectedContent.splice(indexInSelected, 1)
        this.setState({
          selectedContent: newSelectedContent
        })
      } else {
        const indexInContentArr = contentArr.findIndex(e => e.id === id)
        const content = contentArr[indexInContentArr]
        this.setState({
          selectedContent: [content, ...newSelectedContent]
        })
      }
    }

    this.clearSelectedContent = () => {
      this.setState({
        selectedContent: []
      })
    }

    this.deleteActiveLink = () => {
      this.setState({
        isActiveLink: true
      })
    }

    this.addActiveLink = () => {
      this.setState({
        isActiveLink: false
      })
    }

    this.state = {
      selectedContent: JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CONTENT)) || [],
      toggleContent: this.toggleContent,
      clearSelectedContent: this.clearSelectedContent,
      isActiveLink: false,
      deleteActiveLink: this.deleteActiveLink,
      addActiveLink: this.addActiveLink
    }
  }

  componentDidUpdate() {
    localStorage.setItem(LOCAL_STORAGE_KEY_CONTENT, JSON.stringify(this.state.selectedContent))
  }

  render() {
    return (
      <SelectedContentContext.Provider value={this.state}>
        <Router basename="/">
          <div className="container">
            <Switch>
              <Route path="/" exact component={SearchPage} />
              <Route path="/shows" exact component={ShowsPage} />
              <Route path="/:mediaType/:id" component={FullContentInfo} />
              <Route path="/movies" component={MoviesPage} />
              <Route path="/grid-tests" component={GridTests} />
            </Switch>
            {/* <ScrollToTop /> */}
          </div>
        </Router>
      </SelectedContentContext.Provider>
    )
  }
}
