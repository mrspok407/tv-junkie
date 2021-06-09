import React, { useState, useEffect, useContext } from "react"
import { ContactsContext } from "../../@Context/ContactsContext"
import "./HandleNewGroup.scss"

type Props = {
  createNewGroup?: boolean
  createNewGroupFun?: () => void
}

const HandleNewGroup: React.FC<Props> = ({ createNewGroup = false, createNewGroupFun }) => {
  const context = useContext(ContactsContext)
  const openAddMembersComponent = () => {
    context?.dispatch({ type: "toggleIsActiveGroupCreation", payload: { isActive: true } })
  }
  return (
    <div className="handle-new-group">
      <button
        type="button"
        onClick={() => {
          if (createNewGroup && createNewGroupFun) {
            createNewGroupFun()
          } else {
            openAddMembersComponent()
          }
        }}
      ></button>
    </div>
  )
}

export default HandleNewGroup
