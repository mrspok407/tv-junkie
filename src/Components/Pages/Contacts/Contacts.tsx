import Footer from "Components/UI/Footer/Footer"
import Header from "Components/UI/Header/Header"
import React from "react"
import { Helmet } from "react-helmet"
import ContactsContent from "./ContactsContent"
import "./styles/index.scss"

type Props = {}

const Contacts: React.FC<Props> = () => {
  return (
    <>
      <Helmet>
        <title>Contacts | TV Junkie</title>
      </Helmet>
      <Header contactsPage={true} />
      <ContactsContent />
      <Footer />
    </>
  )
}

export default Contacts
