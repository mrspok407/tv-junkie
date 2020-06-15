import React, { Component } from "react"
import ScrollToTop from "Utils/ScrollToTop"
import HeaderBase from "Components/Header/Header"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import ShowsContent from "./ShowsContent"

const Header = withFirebase(HeaderBase)

class Shows extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  componentWillUnmount() {}

  render() {
    return (
      <>
        <Header />
        <ShowsContent />
        <ScrollToTop />
      </>
    )
  }
}

export default Shows
