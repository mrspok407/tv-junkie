import Header from 'Components/UI/Header/Header'
import useAuthorization from 'Components/UserAuth/Session/Authentication/Hooks/useAuthorization'
import React from 'react'
import { Helmet } from 'react-helmet'
import ContactsContent from './ContactsContent'
import './styles/index.scss'

const Contacts: React.FC = () => {
  const isAuthorize = useAuthorization({})
  if (!isAuthorize) return null
  return (
    <>
      <Helmet>
        <title>Contacts | TV Junkie</title>
      </Helmet>
      <Header contactsPage isLogoVisible={false} />
      <ContactsContent />
    </>
  )
}

export default Contacts
