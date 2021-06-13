import { ContactInfoInterface } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useState, useEffect } from "react"
import SearchInput from "../SearchInput/SearchInput"
import Contact from "./Components/Contact/Contact"
import "./SelectName.scss"

type Props = {
  contactsList: ContactInfoInterface[]
}

const SelectName: React.FC<Props> = ({ contactsList }) => {
  const { firebase, authUser, errors, contactsContext, contactsState } = useFrequentVariables()
  const { groupCreation } = contactsState

  const [groupName, setGroupName] = useState("")
  const [error, setError] = useState("")

  const handleChange = (e: any) => {
    setGroupName(e.target.value)
    contactsContext?.dispatch({
      type: "updateGroupCreation",
      payload: { error: `${e.target.value.length >= 5 ? "Name can't be more than 45 characters" : ""}` }
    })
  }

  const resetSearch = () => {
    setGroupName("")
    contactsContext?.dispatch({
      type: "updateGroupCreation",
      payload: { error: "" }
    })
  }

  const handleKeyDown = (e: any) => {
    if (e.which === 27) resetSearch()
  }

  const contactsToRender = contactsList.filter((contact) =>
    groupCreation.members.map((member) => member.key).includes(contact.key)
  )
  return (
    <div className="group-creation group-creation--select-name">
      <div className="group-creation__heading">
        <div className="group-creation__heading-go-back">
          <button
            type="button"
            onClick={() =>
              contactsContext?.dispatch({
                type: "updateGroupCreation",
                payload: { selectNameActive: false, error: "" }
              })
            }
          ></button>
        </div>
        <div className="group-creation__heading-text">New group</div>
      </div>
      <div className="group-creation__group-name">
        <div className="group-creation__group-name-input">
          <input
            type="text"
            placeholder="Group name"
            value={groupName}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          {groupName && <button type="button" className="button--input-clear" onClick={resetSearch} />}
        </div>
        {groupCreation.error && <div className="group-creation__group-name-error">{groupCreation.error}</div>}
      </div>
      <div className="contact-list">
        {contactsToRender.map((contact) => (
          <Contact key={contact.key} contact={contact} />
        ))}
      </div>
    </div>
  )
}

export default SelectName
