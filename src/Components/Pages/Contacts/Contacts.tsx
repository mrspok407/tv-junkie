import Footer from "Components/UI/Footer/Footer"
import Header from "Components/UI/Header/Header"
import withAuthorization from "Components/UserAuth/Session/WithAuthorization/WithAuthorization"
import React from "react"
import { Helmet } from "react-helmet"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"
import ContactsContent from "./ContactsContent"
import "./styles/index.scss"

type Props = {}

const Contacts: React.FC<Props> = () => {
  return (
    <>
      <Helmet>
        <title>Contacts | TV Junkie</title>
      </Helmet>
      <Header contactsPage={true} isLogoVisible={false} />
      <ContactsContent />
      <Footer />
    </>
  )
}

const condition = (authUser: AuthUserInterface) => authUser !== null

export default withAuthorization(condition)(Contacts)
