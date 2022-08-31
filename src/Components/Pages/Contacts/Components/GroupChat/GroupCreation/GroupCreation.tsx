import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import React, { useState, useLayoutEffect, useCallback } from 'react'
import ContactsSearch from './Components/ContactsSearch/ContactsSearch'
import SelectName from './Components/SelectName/SelectName'
import './GroupCreation.scss'

type Props = {
  contactListWrapperRef: HTMLDivElement
}

const GroupCreation: React.FC<Props> = ({ contactListWrapperRef }) => {
  const { contactsState, contactsDispatch } = useFrequentVariables()
  const { groupCreation } = contactsState

  const [createGroupWrapperNode, setCreateGroupWrapperNode] = useState<HTMLDivElement>(null!)

  const createGroupWrapperRef = useCallback((node: any) => {
    if (node !== null) {
      setCreateGroupWrapperNode(node)
    }
  }, [])

  useLayoutEffect(() => {
    contactListWrapperRef.scrollTop = 0
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="group-creation" ref={createGroupWrapperRef}>
      {groupCreation.selectNameActive && <SelectName />}
      <div className="group-creation__heading">
        <div className="group-creation__heading-go-back">
          <button
            type="button"
            onClick={() => contactsDispatch({ type: 'updateGroupCreation', payload: { isActive: false, error: '' } })}
          />
        </div>
        <div className="group-creation__heading-text">Add members</div>
      </div>
      <ContactsSearch wrapperRef={createGroupWrapperNode} />
    </div>
  )
}

export default GroupCreation
