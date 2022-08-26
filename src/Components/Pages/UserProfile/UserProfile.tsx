import React from 'react'
import ScrollToTopBar from 'Utils/ScrollToTopBar'
import Header from 'Components/UI/Header/Header'
import Footer from 'Components/UI/Footer/Footer'
import UserProfileContent from './UserProfileContent'
import UserProfileInfo from './UserProfileInfo'
import './UserProfile.scss'

type Props = {
  match: { params: { uid: string } }
}

const Shows: React.FC<Props> = ({
  match: {
    params: { uid },
  },
}) => (
  <>
    <Header />
    <UserProfileInfo userUid={uid} />
    <UserProfileContent userUid={uid} />
    <Footer />
    <ScrollToTopBar />
  </>
)

export default Shows
