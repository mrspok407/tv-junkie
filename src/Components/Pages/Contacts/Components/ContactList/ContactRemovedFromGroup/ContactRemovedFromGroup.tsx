import classNames from "classnames"
import React, { useEffect, useRef, useState } from "react"
import { ContactInfoInterface } from "../../../@Types"
import ContactOptionsPopup from "../../ContactOptionsPopup/ContactOptionsPopup"
import useFrequentVariables from "Utils/Hooks/UseFrequentVariables"
import useFirebaseReferences from "Components/Pages/Contacts/Hooks/UseFirebaseReferences"
import "../Contact/Contact.scss"

type Props = {
  contactInfo: ContactInfoInterface
  allContactsAmount: number | null
}

const Contact: React.FC<Props> = React.memo(({ contactInfo }) => {
  const { firebase, authUser, contactsState, contactsDispatch } = useFrequentVariables()
  const firebaseRefs = useFirebaseReferences()
  const { optionsPopupContactList, activeChat } = contactsState

  const contactOptionsRef = useRef<HTMLDivElement>(null!)
  const chatKey = contactInfo.chatKey

  const [newActivity, setNewActivity] = useState<boolean | null | undefined>(contactInfo.newContactsActivity)

  const setContactActive = () => {
    if (activeChat.chatKey === chatKey) return
    contactsDispatch({ type: "updateActiveChat", payload: { chatKey, contactKey: contactInfo.key } })
    firebase.newContactsActivity({ uid: authUser?.uid }).child(`${contactInfo.key}`).set(null)
  }

  useEffect(() => {
    firebase
      .newContactsActivity({ uid: authUser?.uid! })
      .child(`${contactInfo.key}`)
      .on("value", (snapshot: any) => setNewActivity(snapshot.val()))

    firebaseRefs.setMemberStatus({ value: null, isGroupChat: true })
    return () => {
      firebase.newContactsActivity({ uid: authUser?.uid }).child(`${contactInfo.key}`).off()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isPinned = !!(contactInfo.pinned_lastActivityTS?.slice(0, 4) === "true")
  const contactNameCutLength = contactInfo.userName || contactInfo.groupName || ""
  const contactNameFormated =
    contactNameCutLength[contactNameCutLength?.length - 1] === " "
      ? contactNameCutLength?.slice(0, -1)
      : contactNameCutLength

  const chatActive = activeChat.contactKey === contactInfo.key
  return (
    <div
      className={classNames("contact-item", {
        "contact-item--active": chatActive
      })}
      onClick={() => setContactActive()}
    >
      <div className="contact-item__row contact-item__row--top">
        <div className="contact-item__username">
          {contactInfo.isGroupChat
            ? contactInfo.groupName?.length > 25
              ? `${contactNameFormated}...`
              : contactInfo.groupName
            : contactInfo.userName?.length > 25
            ? `${contactNameFormated}...`
            : contactInfo.userName}
        </div>
      </div>

      <div className="contact-item__row contact-item__row--bottom">
        <div ref={contactOptionsRef} className="contact-item__options">
          <button
            type="button"
            className={classNames("contact-item__open-popup-btn", {
              "contact-item__open-popup-btn--open": optionsPopupContactList === contactInfo.key
            })}
            onClick={(e) => {
              e.stopPropagation()
              contactsDispatch({ type: "updateOptionsPopupContactList", payload: contactInfo.key })
            }}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {optionsPopupContactList === contactInfo.key && (
            <ContactOptionsPopup contactOptionsRef={contactOptionsRef.current} contactInfo={contactInfo} />
          )}
        </div>
        {contactInfo.isGroupChat && <div className="contact-item__group-chat-icon"></div>}
        {newActivity ? (
          <div
            className={classNames("contact-item__unread-messages", {
              "contact-item__unread-messages--active": chatActive
            })}
          ></div>
        ) : (
          isPinned && <div className="contact-item__pinned"></div>
        )}
      </div>
    </div>
  )
})

export default Contact
