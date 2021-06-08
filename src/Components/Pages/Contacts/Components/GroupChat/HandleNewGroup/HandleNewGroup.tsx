import React, { useState, useEffect } from "react"
import "./HandleNewGroup.scss"

type Props = {
  createNewGroup?: boolean
  createNewGroupFun?: () => void
}

const HandleNewGroup: React.FC<Props> = ({ createNewGroup = false, createNewGroupFun }) => {
  const openAddMembersComponent = () => {
    console.log("test")
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
