import classNames from "classnames"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useState, useEffect, useContext } from "react"
import { ContactsContext } from "../../@Context/ContactsContext"
import useCreateNewGroup from "../Hooks/UseCreateNewGroup"
import "./HandleNewMembers.scss"

const HandleNewGroup: React.FC = () => {
  const { contactsContext, contactsState } = useFrequentVariables()
  const { groupCreation } = contactsState

  const { createNewGroup } = useCreateNewGroup()

  return (
    <div
      className={classNames("handle-new-members", {
        "handle-new-members--arrow": groupCreation.isActive,
        "handle-new-members--loading": groupCreation.loading
      })}
    >
      <button
        type="button"
        onClick={() => {
          if (!groupCreation.isActive) {
            contactsContext?.dispatch({ type: "updateGroupCreation", payload: { isActive: true } })
          } else {
            if (!groupCreation.selectNameActive) {
              contactsContext?.dispatch({ type: "updateGroupCreation", payload: { selectNameActive: true } })
            } else {
              if (groupCreation.loading) return
              createNewGroup()
            }
          }
        }}
      ></button>
    </div>
  )
}

export default HandleNewGroup
