import { AppContext } from "Components/AppContext/AppContextHOC"
import { FirebaseContext } from "Components/Firebase"
import React, { useState, useEffect, useLayoutEffect, useCallback, useContext } from "react"
import { ContactsContext } from "../../Context/ContactsContext"

type Props = {
  chatContainerRef: HTMLDivElement
  isScrollBottomRef: boolean
}

const useResizeObserver = ({ chatContainerRef, isScrollBottomRef }: Props) => {
  const { authUser } = useContext(AppContext)
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { activeChat } = context?.state!

  const handleResize = useCallback(() => {
    if (!chatContainerRef) return
    const height = chatContainerRef.getBoundingClientRect().height
    const scrollHeight = chatContainerRef.scrollHeight

    if (scrollHeight <= height) {
      isScrollBottomRef = true
      firebase.chatMemberStatus({ chatKey: activeChat.chatKey, memberKey: authUser?.uid! }).update({ chatBottom: true })
    }
  }, [chatContainerRef, activeChat])

  useLayoutEffect(() => {
    if (!chatContainerRef) return
    if (window.ResizeObserver) {
      let resizeObserver = new ResizeObserver(() => handleResize())
      resizeObserver.observe(chatContainerRef)

      return () => {
        if (!resizeObserver) return
        resizeObserver.disconnect()
      }
    } else {
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [chatContainerRef, handleResize])
}

export default useResizeObserver
