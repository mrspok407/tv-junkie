import Header from 'Components/UI/Header/Header'
import withAuthorization from 'Components/UserAuth/Session/WithAuthorization/WithAuthorization'
import React from 'react'
import { Helmet } from 'react-helmet'
import { AuthUserInterface } from 'Components/UserAuth/Session/WithAuthentication/@Types'
import ContactsContent from './ContactsContent'
import './styles/index.scss'

type Props = {}

const Contacts: React.FC<Props> = () => (
  <>
    <Helmet>
      <title>Contacts | TV Junkie</title>
    </Helmet>
    <Header contactsPage isLogoVisible={false} />
    <ContactsContent />
  </>
  )

const condition = (authUser: AuthUserInterface['authUser']) => authUser !== null

export default withAuthorization(condition)(Contacts)
