import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useState, useEffect } from "react"
import Contact from "./Components/Contact/Contact"
import "./SelectName.scss"

type Props = {}

const NAME_LENGTH_LIMIT = 45

const SelectName: React.FC<Props> = () => {
  const { firebase, contactsState, contactsDispatch } = useFrequentVariables()
  const { groupCreation } = contactsState
  const selectedMembersData = groupCreation.members

  const [membersWithStatus, setMembersWithStatus] = useState<{ key: string; isOnline: boolean | null }[]>([])

  useEffect(() => {
    ;(async () => {
      const membersStatus = await Promise.all(
        selectedMembersData.map(async (member) => {
          const contactStatus = await Promise.all([
            firebase.contactsDatabase({ uid: member.key }).child("pageIsOpen").once("value"),
            firebase
              .chatMemberStatus({ chatKey: member.chatKey!, memberKey: member.key, isGroupChat: false })
              .child("lastSeen")
              .once("value")
          ])
          return { ...member, isOnline: contactStatus[0].val(), lastSeen: contactStatus[1].val() }
        })
      )
      setMembersWithStatus(membersStatus)
    })()
  }, [selectedMembersData, firebase])

  const handleChange = (e: any) => {
    contactsDispatch({
      type: "updateGroupCreation",
      payload: {
        groupName: e.target.value,
        error: `${e.target.value?.length >= NAME_LENGTH_LIMIT ? "Name can't be more than 45 characters" : ""}`
      }
    })
  }

  const resetSearch = () => {
    contactsDispatch({ type: "updateGroupCreation", payload: { groupName: "", error: "" } })
  }

  const handleKeyDown = (e: any) => {
    if (e.which === 27) resetSearch()
  }

  return (
    <div className="group-creation group-creation--select-name">
      <div className="group-creation__heading">
        <div className="group-creation__heading-go-back">
          <button
            type="button"
            onClick={() =>
              contactsDispatch({
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
            value={groupCreation.groupName}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          {groupCreation.groupName && <button type="button" className="button--input-clear" onClick={resetSearch} />}
        </div>
        {groupCreation.error && <div className="group-creation__group-name-error">{groupCreation.error}</div>}
      </div>
      <div className="contact-list">
        {membersWithStatus.map((member) => (
          <Contact key={member.key} member={member} />
        ))}
      </div>
    </div>
  )
}

export default SelectName
