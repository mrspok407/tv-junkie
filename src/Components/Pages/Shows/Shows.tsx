import React from "react"
import { Helmet } from "react-helmet"
import ScrollToTop from "Utils/ScrollToTopBar"
import Header from "Components/UI/Header/Header"
import ShowsContent from "./ShowsContent"
import Footer from "Components/UI/Footer/Footer"

const Shows: React.FC = () => {
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

export default Shows
