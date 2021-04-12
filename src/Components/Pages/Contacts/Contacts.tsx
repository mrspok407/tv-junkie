import Footer from "Components/UI/Footer/Footer"
import Header from "Components/UI/Header/Header"
import React from "react"
import "./Contacts.scss"
import ContactsContent from "./ContactsContent"

type Props = {}

const Contacts: React.FC<Props> = () => {
  return (
    <>
      <Header />
      <ContactsContent />
      <Footer />
    </>
  )
}

export default Contacts
