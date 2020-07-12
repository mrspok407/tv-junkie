import React, { Component } from "react"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import ScrollToTop from "Utils/ScrollToTop"
import HeaderBase from "Components/Header/Header"
import ToWatchEpisodesContent from "./ToWatchEpisodesContent"
import "./ToWatchEpisodesPage.scss"

const Header = withFirebase(HeaderBase)

class ToWatchEpisodesPage extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    return (
      <>
        <Header />
        <ToWatchEpisodesContent />
        <ScrollToTop />
      </>
    )
  }
}

export default ToWatchEpisodesPage
