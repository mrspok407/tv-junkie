import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import React, { useState, useEffect, useContext } from "react"
import { ContactsContext } from "../../@Context/ContactsContext"

type Props = {
  chatKey: string
  contactKey: string
}

const useHandleContactsStatus = ({ chatKey, contactKey }: Props) => {
  const { authUser } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)

  useEffect(() => {
    firebase.chatMemberStatus({ chatKey, memberKey: contactKey }).on("value", (snapshot: any) => {
      context?.dispatch({
        type: "updateContactsStatus",
        payload: { status: snapshot.val() || {}, chatKey }
      })
    })

    firebase
      .chatMemberStatus({ chatKey, memberKey: authUser?.uid! })
      .onDisconnect()
      .update({ isOnline: null, pageInFocus: false })
  }, [chatKey, contactKey])
}

export default useHandleContactsStatus
