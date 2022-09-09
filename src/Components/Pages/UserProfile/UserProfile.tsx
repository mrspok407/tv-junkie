import React from 'react'
import ScrollToTopBar from 'Utils/ScrollToTopBar'
import Header from 'Components/UI/Header/Header'
import Footer from 'Components/UI/Footer/Footer'
import { useParams } from 'react-router-dom'
import UserProfileContent from './UserProfileContent'
import UserProfileInfo from './UserProfileInfo'
import './UserProfile.scss'

type Params = {
  uid: string
}

const UserProfile: React.FC = () => {
  const { uid } = useParams<Params>()

  return (
    <>
      <Header />
      <UserProfileInfo userUid={uid!} />
      <UserProfileContent userUid={uid!} />
      <Footer />
      <ScrollToTopBar />
    </>
  )
}

export default UserProfile
