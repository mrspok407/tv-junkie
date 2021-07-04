import classNames from "classnames"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import { ContactInfoInterface, CONTACT_INFO_INITIAL_DATA } from "Components/Pages/Contacts/@Types"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import React, { useState, useEffect, useContext, useRef, useLayoutEffect, useCallback } from "react"
import { isUnexpectedObject } from "Utils"
import Contact from "./Components/Contact/Contact"
import ContactsSearch from "./Components/ContactsSearch/ContactsSearch"
import SearchInput from "./Components/SearchInput/SearchInput"
import SelectName from "./Components/SelectName/SelectName"
import "./GroupCreation.scss"

type Props = {
  contactListWrapperRef: HTMLDivElement
}

const GroupCreation: React.FC<Props> = ({ contactListWrapperRef }) => {
  const { firebase, authUser, errors, contactsContext, contactsState } = useFrequentVariables()
  const { groupCreation } = contactsState

  const [createGroupWrapperNode, setCreateGroupWrapperNode] = useState<HTMLDivElement>(null!)

  // const createGroupWrapperRef = useRef<HTMLDivElement>(null!)

  const createGroupWrapperRef = useCallback((node) => {
    if (node !== null) {
      setCreateGroupWrapperNode(node)
    }
  }, [])

  useLayoutEffect(() => {
    contactListWrapperRef.scrollTop = 0
  }, [])

  return (
    <div className="group-creation" ref={createGroupWrapperRef}>
      {groupCreation.selectNameActive && <SelectName />}
      <div className="group-creation__heading">
        <div className="group-creation__heading-go-back">
          <button
            type="button"
            onClick={() =>
              contactsContext?.dispatch({ type: "updateGroupCreation", payload: { isActive: false, error: "" } })
            }
          ></button>
        </div>
        <div className="group-creation__heading-text">Add members</div>
      </div>
      <ContactsSearch wrapperRef={createGroupWrapperNode} />
    </div>
  )
}

export default GroupCreation
