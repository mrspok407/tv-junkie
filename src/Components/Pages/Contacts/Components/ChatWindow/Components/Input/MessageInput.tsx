import { ContainerRectInterface, MessageInputInterface } from "Components/Pages/Contacts/@Types"
import React, { useState, useEffect, useRef, useContext, useCallback, useLayoutEffect } from "react"
import debounce from "debounce"
import "./MessageInput.scss"
import { ContactsContext } from "../../../@Context/ContactsContext"
import { INPUT_MESSAGE_MAX_HEIGHT } from "../../../@Context/Constants"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"

type Props = {
  chatContainerRef: HTMLDivElement
  getContainerRect: () => ContainerRectInterface
}

const MessageInput: React.FC<Props> = ({ chatContainerRef, getContainerRect }) => {
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { authUser, errors } = useContext(AppContext)
  const { activeChat, messagesInput, contactsStatus } = context?.state!
  const messageInputData = messagesInput[activeChat.chatKey]
  const contactsStatusData = contactsStatus[activeChat.chatKey]
  const inputRef = useRef<HTMLDivElement>(null!)

  const keysMap = useRef<any>({})

  const anchorOffsetRef = useRef<number>(null!)

  useLayoutEffect(() => {
    const selection = window.getSelection()
    inputRef.current.innerHTML = messageInputData?.message || ""
    if (!inputRef.current.innerHTML) {
      inputRef.current.focus()
    } else {
      const range = document.createRange()
      console.log({ length: inputRef.current.childNodes[0] })
      range.setStart(
        inputRef.current.childNodes[0],
        Math.min(messageInputData.anchorOffset, inputRef.current.childNodes[0]?.textContent?.length!)
      )
      range.collapse(true)

      selection?.removeAllRanges()
      selection?.addRange(range)

      inputRef.current.scrollTop = messageInputData.scrollTop
    }
    return () => {
      debounced.flush()
    }
  }, [activeChat])

  const debounced = useCallback(
    debounce((payload: MessageInputInterface) => context?.dispatch({ type: "updateMessageInput", payload }), 100),
    []
  )

  const onClick = (e: any) => {
    // const inputRef = document.querySelector(".chat-window__input-message") as Node
    // console.log(inputRef.childNodes)

    const anchorOffset = window.getSelection()?.anchorOffset
    anchorOffsetRef.current = anchorOffset!

    const innerHtml = e.currentTarget.innerHTML

    debounced({ anchorOffset })

    // console.log(e.target.childNodes)

    console.log({ anchorOffset: anchorOffset })
    // console.log({ focusOffset: sel?.focusOffset })
    // console.log({ collapsed: sel?.isCollapsed })
    // console.log({ rangeCount: sel?.rangeCount })
    // console.log({ anchorNode: sel?.anchorNode?.parentNode?.childNodes[0] })

    // if (sel?.rangeCount! > 0) {
    //   sel?.removeAllRanges()
    // }

    // let range: any = document.createRange()
    // range.setStart(e.target.childNodes[0], 2)
    // range.setEnd(e.target.childNodes[0], 4)

    // sel?.addRange(range)
  }

  const scrollPositionHandler = useCallback(
    debounce(() => {
      const scrollTop = inputRef.current.scrollTop
      const innerHTML = inputRef.current.innerHTML
      const anchorOffset = window.getSelection()?.anchorOffset!
      context?.dispatch({ type: "updateMessageInput", payload: { message: innerHTML, anchorOffset, scrollTop } })
    }, 100),
    [activeChat]
  )

  const handleOnChange = (e: any) => {
    const { innerHTML, textContent } = e.currentTarget
    const anchorOffset = window.getSelection()?.anchorOffset!
    const scrollTop = inputRef.current.scrollTop
    if (textContent === "" || textContent === "\n") {
      e.currentTarget.innerHTML = ""
      debounced({ message: "", anchorOffset: 0, scrollTop: 0 })
    }
    debounced({ message: innerHTML, anchorOffset, scrollTop })
  }

  const handleKeyDown = async (e: any) => {
    const selection = window.getSelection()
    anchorOffsetRef.current = selection?.anchorOffset!
    const { innerHTML, textContent } = e.currentTarget
    const scrollTop = inputRef.current.scrollTop

    keysMap.current[e.key] = e.type === "keydown"

    if (e.which === 32 && textContent === "") {
      e.preventDefault()
      e.currentTarget.innerHTML = ""
    }
    if (e.key === "Enter") {
      e.preventDefault()
      if (e.currentTarget.innerHTML === "") return
      if (keysMap.current.Shift) {
        console.log({ textContent })
        if (textContent === "") {
          e.currentTarget.innerHTML = ""
          return
        }
        const lastIndexBr = innerHTML.lastIndexOf("\n")

        if (lastIndexBr === -1 || lastIndexBr < innerHTML.length - 1) {
          if (selection?.anchorOffset! === innerHTML.length) {
            e.currentTarget.innerHTML = `${innerHTML}\n\n`
          } else {
            e.currentTarget.innerHTML = `${innerHTML.slice(0, selection?.anchorOffset!)}\n${innerHTML.slice(
              selection?.anchorOffset!
            )}`
          }
        } else {
          if (selection?.anchorOffset! === innerHTML.length) {
            e.currentTarget.innerHTML = `${innerHTML}\n`
          } else {
            e.currentTarget.innerHTML = `${innerHTML.slice(0, selection?.anchorOffset!)}\n${innerHTML.slice(
              selection?.anchorOffset!
            )}`
          }
        }

        const range = document.createRange()
        range.setStart(e.currentTarget.childNodes[0], anchorOffsetRef.current + 1)
        range.collapse(true)

        selection?.removeAllRanges()
        selection?.addRange(range)

        inputRef.current.scrollTop = scrollTop + 25
        if (inputRef.current.getBoundingClientRect().height <= INPUT_MESSAGE_MAX_HEIGHT) {
          chatContainerRef.scrollTop = getContainerRect().scrollTop + 25
        }
      } else {
        console.log("enter")
        try {
          const timeStampEpoch = new Date().getTime()
          const messageRef = firebase.privateChats().child(`${activeChat.chatKey}/messages`).push()
          const messageKey = messageRef.key
          const updateData = {
            [`messages/${messageKey}`]: {
              sender: authUser?.uid,
              message: e.currentTarget.innerHTML,
              timeStamp: timeStampEpoch * 2
            },
            [`members/${activeChat.contactKey}/unreadMessages/${messageKey}`]:
              !contactsStatusData?.isOnline || !contactsStatusData?.chatBottom || !contactsStatusData?.pageInFocus
                ? true
                : null
          }
          e.currentTarget.innerHTML = ""
          context?.dispatch({ type: "updateMessageInput", payload: { message: "", anchorOffset: 0, scrollTop: 0 } })
          await firebase.privateChats().child(activeChat.chatKey).update(updateData)
        } catch (error) {
          errors.handleError({
            message: "Message hasn't been sent, because of the unexpected error. Please reload the page."
          })
        }
      }
    }
  }

  const handleKeyUp = (e: any) => {
    const { innerHTML } = e.currentTarget
    const scrollTop = inputRef.current.scrollTop
    const selection = window.getSelection()
    console.log(selection?.anchorOffset)
    if (e.key === "ArrowRight" || e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "ArrowDown") {
      debounced({ message: innerHTML, anchorOffset: selection?.anchorOffset, scrollTop })
    }
    keysMap.current[e.key] = e.type === "keydown"
  }

  useEffect(() => {
    inputRef.current.addEventListener("scroll", scrollPositionHandler)
    return () => {
      inputRef.current.removeEventListener("scroll", scrollPositionHandler)
    }
  }, [activeChat])

  return (
    <div className="chat-window__input-wrapper">
      <div className="chat-window__input-message-container">
        <div
          ref={inputRef}
          onClick={onClick}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onInput={handleOnChange}
          className="chat-window__input-message"
          contentEditable="true"
          dir="auto"
          data-placeholder="Message"
          suppressContentEditableWarning={true}
          spellCheck="false"
        ></div>
      </div>
    </div>
  )
}

export default MessageInput
