import React, { Component } from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import SearchPage from "./Components/SearchPage/SearchPage"
import Header from "./Components/Header/Header"
import ShowsPage from "./Components/ShowsPage/ShowsPage"
import MoviesPage from "./Components/MoviesPage/MoviesPage"
import ScrollToTop from "./Utils/ScrollToTop"
import { SelectedContentContext } from "./Components/Context/SelectedContentContext"

const LOCAL_STORAGE_KEY_CONTENT = "selectedContent"

// export const SelectedContentContext = createContext()

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

    this.state = {
      selectedContent:
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CONTENT)) || [],
      toggleContent: this.toggleContent,
      clearSelectedContent: this.clearSelectedContent
    }
  }

  componentDidUpdate() {
    localStorage.setItem(
      LOCAL_STORAGE_KEY_CONTENT,
      JSON.stringify(this.state.selectedContent)
    )
  }

  render() {
    return (
      <SelectedContentContext.Provider value={this.state}>
        <Router>
          <div className="container">
            <Header />
            <Switch>
              <Route path="/" exact component={SearchPage} />
              <Route path="/shows" component={ShowsPage} />
              <Route path="/movies" component={MoviesPage} />
            </Switch>
            <ScrollToTop />
          </div>
        </Router>
      </SelectedContentContext.Provider>
    )
  }
}
