import classNames from "classnames"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useState, useEffect, useContext } from "react"
import { ContactsContext } from "../../@Context/ContactsContext"
import useCreateNewGroup from "../Hooks/UseCreateNewGroup"
import "./HandleNewGroup.scss"

// type Props = {
//   createNewGroup?: boolean
//   createNewGroupFun?: () => void
// }

const HandleNewGroup: React.FC = () => {
  const { contactsContext, contactsState } = useFrequentVariables()
  const { groupCreation } = contactsState

  const { createNewGroup } = useCreateNewGroup()

  return (
    <div
      className={classNames("handle-new-group", {
        "handle-new-group--create": groupCreation.isActive
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
              createNewGroup()
            }
          }
        }}
      ></button>
    </div>
  )
}

export default HandleNewGroup
