import classNames from "classnames"
import useFrequentVariables from "Utils/Hooks/UseFrequentVariables"
import React, { useState, useRef } from "react"
import MembersMenu from "./Components/MembersMenu/MembersMenu"
import NewMembersMenu from "./Components/NewMembersMenu/NewMembersMenu"
import "./GroupInfoSettings.scss"

const GroupInfoSettings: React.FC = () => {
  const { contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, contacts } = contactsState
  const contactInfo = contacts[activeChat.chatKey] || {}

  const [currentMenu, setCurrentMenu] = useState("members")

  const groupInfoRef = useRef<HTMLDivElement>(null!)

  const renderMenu = () => {
    switch (currentMenu) {
      case "members": {
        return <MembersMenu />
      }

      case "addNewMembers": {
        return <NewMembersMenu />
      }
    }
  }

  return (
    <div ref={groupInfoRef} className="group-info-wrapper">
      <div className="group-info">
        <div
          className={classNames("group-info__options", {
            "group-info__options--admin": contactInfo.role === "ADMIN"
          })}
        >
          <div
            className={classNames("group-info__options-menu", {
              "group-info__options-menu--active": currentMenu === "members"
            })}
            onClick={() => setCurrentMenu("members")}
          >
            Members
          </div>
          {contactInfo.role === "ADMIN" && (
            <div
              className={classNames("group-info__options-menu", {
                "group-info__options-menu--active": currentMenu === "addNewMembers"
              })}
              onClick={() => setCurrentMenu("addNewMembers")}
            >
              Add new members
            </div>
          )}
        </div>
        <div className="group-info__menu">{renderMenu()}</div>
      </div>
      <div className="group-info__close">
        <button
          type="button"
          className="group-info__close-btn"
          onClick={() => contactsDispatch({ type: "updateGroupInfoSettings", payload: { isActive: false } })}
        ></button>
      </div>
    </div>
  )
}

export default GroupInfoSettings
