import React, { Component } from "react"
import { Helmet } from "react-helmet"
import ScrollToTop from "Utils/ScrollToTop"
import HeaderBase from "Components/Header/Header"
import { withFirebase } from "Components/Firebase/FirebaseContext"
import ShowsContent from "./ShowsContent"
import Footer from "Components/Footer/Footer"

const Header = withFirebase(HeaderBase)

class Shows extends Component {
  render() {
    return (
      <>
        <Helmet>
          <title>All your shows | TV Junkie</title>
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
