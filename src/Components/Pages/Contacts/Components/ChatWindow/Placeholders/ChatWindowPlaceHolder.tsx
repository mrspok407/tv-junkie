import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useEffect } from "react"

type Props = {
  contactKey: string
  text: string
}

const ChatWindowPlaceHolder: React.FC<Props> = ({ contactKey, text }) => {
  const { authUser, firebase, contactsDispatch } = useFrequentVariables()

  useEffect(() => {
    firebase.newContactsActivity({ uid: authUser?.uid }).child(`${contactKey}`).set(null)
  }, [contactKey, authUser, firebase])

  return (
    <div className="chat-window-container chat-window-container--no-active-chat chat-window-container--placeholder">
      <div className="chat-window">{text}</div>
      <div className="chat-window__go-back">
        <button
          className="chat-window__go-back-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            contactsDispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })
          }}
        >
          Go back
        </button>
      </div>
    </div>
  )
}

export default ChatWindowPlaceHolder
