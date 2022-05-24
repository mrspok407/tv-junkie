import Header from 'Components/UI/Header/Header'
import withAuthorization from 'Components/UserAuth/Session/WithAuthorization/WithAuthorization'
import React from 'react'
import { Helmet } from 'react-helmet'
import { AuthUserInterface } from 'Components/UserAuth/Session/WithAuthentication/@Types'
import ContactsContent from './ContactsContent'
import './styles/index.scss'

const Contacts: React.FC = () => (
  <>
    <Helmet>
      <title>Contacts | TV Junkie</title>
    </Helmet>
    <Header contactsPage isLogoVisible={false} />
    <ContactsContent />
  </>
)

const condition = (authUser: AuthUserInterface['authUser']) => !!authUser?.uid

export default withAuthorization(condition)(Contacts)
