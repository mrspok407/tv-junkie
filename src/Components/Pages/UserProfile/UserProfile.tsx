import React from "react"
import { Helmet } from "react-helmet"
import ScrollToTop from "Utils/ScrollToTopBar"
import Header from "Components/UI/Header/Header"
import Footer from "Components/UI/Footer/Footer"
import UserProfileContent from "./UserProfileContent"

type Props = {
  match: { params: { uid: string } }
}

const Shows: React.FC<Props> = ({
  match: {
    params: { uid }
  }
}) => {
  return (
    <>
      <Helmet>
        <title>User Profile | TV Junkie</title>
      </Helmet>
      <Header />
      <UserProfileContent userUid={uid} />
      <Footer />
      <ScrollToTop />
    </>
  )
}

export default Shows
