import classNames from 'classnames'
import useFrequentVariables from 'Utils/Hooks/UseFrequentVariables'
import React from 'react'
import useCreateNewGroup from '../Hooks/UseCreateNewGroup'
import './HandleNewMembers.scss'

const HandleNewMembers: React.FC = () => {
  const { contactsState, contactsDispatch } = useFrequentVariables()
  const { groupCreation } = contactsState

  const { createNewGroup } = useCreateNewGroup()

  return (
    <div
      className={classNames('handle-new-members', {
        'handle-new-members--arrow': groupCreation.isActive,
        'handle-new-members--loading': groupCreation.loading,
      })}
    >
      <button
        type="button"
        onClick={() => {
          if (!groupCreation.isActive) {
            contactsDispatch({ type: 'updateGroupCreation', payload: { isActive: true } })
          } else if (!groupCreation.selectNameActive) {
              contactsDispatch({ type: 'updateGroupCreation', payload: { selectNameActive: true } })
            } else {
              if (groupCreation.loading) return
              createNewGroup()
            }
        }}
      />
    </div>
  )
}

export default HandleNewMembers
