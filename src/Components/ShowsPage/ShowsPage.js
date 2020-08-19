import React, { Component } from "react"
import { Helmet } from "react-helmet"
import ScrollToTop from "Utils/ScrollToTop"
import HeaderBase from "Components/Header/Header"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import ShowsContent from "./ShowsContent"
import Footer from "Components/Footer/Footer"

const Header = withFirebase(HeaderBase)

class Shows extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    return (
      <>
        <Helmet>
          <title>Tv Junkie | All your shows</title>
        </Helmet>
        <Header />
        <ShowsContent />
        <Footer />
        <ScrollToTop />
      </>
    )
  }
}

export default Shows
