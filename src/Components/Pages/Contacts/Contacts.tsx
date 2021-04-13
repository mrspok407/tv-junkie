import Footer from "Components/UI/Footer/Footer"
import Header from "Components/UI/Header/Header"
import React from "react"
import { Helmet } from "react-helmet"
import ContactsContextHOC from "./Components/Context/ContactsContext"
import "./Contacts.scss"
import ContactsContent from "./ContactsContent"

type Props = {}

const Contacts: React.FC<Props> = () => {
  return (
    <>
      <Helmet>
        <title>Contacts | TV Junkie</title>
      </Helmet>
      <Header />
      <ContactsContent />
      <Footer />
    </>
  )
}

export default ContactsContextHOC(Contacts)
