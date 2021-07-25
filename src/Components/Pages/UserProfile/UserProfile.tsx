import React from "react"
import ScrollToTop from "Utils/ScrollToTopBar"
import Header from "Components/UI/Header/Header"
import Footer from "Components/UI/Footer/Footer"
import UserProfileContent from "./UserProfileContent"
import UserProfileInfo from "./UserProfileInfo"
import "./UserProfile.scss"

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
      <Header />
      <UserProfileInfo userUid={uid} />
      <UserProfileContent userUid={uid} />
      <Footer />
      <ScrollToTop />
    </>
  )
}

export default Shows
