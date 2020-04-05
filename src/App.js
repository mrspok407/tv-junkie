import React, { Component } from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import MainPage from "./Components/MainPage/MainPage"
import Header from "./Components/Header/Header"
import Shows from "./Components/Shows/Shows"
import Movies from "./Components/Movies/Movies"
import ScrollToTop from "./Utils/ScrollToTop"

const LOCAL_STORAGE_KEY_CONTENT = "selectedContent"

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedContent:
        JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY_CONTENT)) || []
    }
  }

  componentDidUpdate() {
    localStorage.setItem(
      LOCAL_STORAGE_KEY_CONTENT,
      JSON.stringify(this.state.selectedContent)
    )
  }

  updateSelectedContent = content => {
    this.setState({ selectedContent: content })
  }

  clearSelectedContent = () => {
    this.setState({ selectedContent: [] })
  }

  toggleContent = (id, contentArr) => {
    const newSelectedContent = [...this.state.selectedContent]
    const indexInSelected = newSelectedContent.findIndex(e => e.id === id)

    if (indexInSelected !== -1) {
      newSelectedContent.splice(indexInSelected, 1)
      this.setState({
        selectedContent: newSelectedContent
      })
    } else {
      const indexInAdvanced = contentArr.findIndex(e => e.id === id)
      const content = contentArr[indexInAdvanced]
      this.setState({
        selectedContent: [content, ...newSelectedContent]
      })
    }
  }

  render() {
    return (
      <Router>
        <div className="container">
          <Header />
          <Switch>
            <Route
              path="/"
              exact
              component={MainPage}
              // render={props => (
              //   <MainPage
              //     {...props}
              //     selectedContent={this.state.selectedContent}
              //     clearSelectedContent={this.clearSelectedContent}
              //     updateSelectedContent={this.updateSelectedContent}
              //     toggleContent={this.toggleContent}
              //   />
              // )}
            />
            <Route
              path="/shows"
              component={Shows}
              // render={props => (
              //   <Shows
              //     {...props}
              //     selectedContent={this.state.selectedContent}
              //     clearSelectedContent={this.clearSelectedContent}
              //     updateSelectedContent={this.updateSelectedContent}
              //     toggleContent={this.toggleContent}
              //   />
              // )}
            />
            <Route
              path="/movies"
              component={Movies}
              // render={props => (
              //   <Movies
              //     {...props}
              //     selectedContent={this.state.selectedContent}
              //     clearSelectedContent={this.clearSelectedContent}
              //     updateSelectedContent={this.updateSelectedContent}
              //     toggleContent={this.toggleContent}
              //   />
              // )}
            />
          </Switch>
          <ScrollToTop />
          {/* <MainPage /> */}
        </div>
      </Router>
    )
  }
}
