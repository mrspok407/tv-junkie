import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import useResponseContactRequest from "Components/Pages/UserProfile/Hooks/UseResponseContactRequest"
import React from "react"
import "./NewRequestOptions.scss"

const NewRequestOptions: React.FC = () => {
  const { contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, contacts } = contactsState
  const contactInfo = contacts[activeChat.contactKey]

  const { handleContactRequest, responseContactRequestLoading } = useResponseContactRequest({
    contactUid: activeChat.contactKey
  })

  const renderMarkup = () => {
    switch (contactInfo.receiver) {
      case false: {
        return (
          contactInfo.status === false && (
            <>
              <div className="new-request__message">
                <span className="new-request__name">{contactInfo.userName}</span> wants to connect
              </div>

              <div className="new-request__actions--receiver">
                <button className="button" onClick={() => handleContactRequest({ status: "accept" })}>
                  {responseContactRequestLoading.accept ? <span className="button-loader-circle"></span> : "Accept"}
                </button>
                <button
                  className="button"
                  onClick={() => {
                    if (Object.values(responseContactRequestLoading).some((item) => item)) return
                    handleContactRequest({ status: "rejected" })
                    contactsDispatch({ type: "updateActiveChat", payload: { chatKey: "", contactKey: "" } })
                  }}
                >
                  {responseContactRequestLoading.rejected ? <span className="button-loader-circle"></span> : "Reject"}
                </button>
              </div>
            </>
          )
        )
      }

      case true: {
        return contactInfo.status === false ? (
          <div className="new-request__message">
            The invitation to connect has been sent to{" "}
            {<span className="new-request__name">{contactInfo.userName}</span>}
          </div>
        ) : (
          contactInfo.status === "rejected" && (
            <div className="new-request__message">
              {<span className="new-request__name">{contactInfo.userName}</span>} rejected you connect request{" "}
            </div>
          )
        )
      }

      //   case undefined: {
      //     return (
      //       <div className="new-request__message">
      //         <span className="new-request__name">{contactInfo.userName}</span> removed you from contacts
      //       </div>
      //     )
      //   }
    }
  }

  return (
    <div className="chat-window chat-window--request">
      <div className="new-request">{renderMarkup()}</div>
    </div>
  )
}

export default NewRequestOptions
