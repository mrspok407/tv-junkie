import { ContainerRectInterface, MessageInputInterface, MessageInterface } from "Components/Pages/Contacts/@Types"
import React, { useEffect, useRef, useContext, useCallback, useLayoutEffect } from "react"
import debounce from "debounce"
import { ContactsContext } from "../../../@Context/ContactsContext"
import { INPUT_MESSAGE_MAX_HEIGHT, MESSAGE_LINE_HEIGHT, MOBILE_LAYOUT_THRESHOLD } from "../../../@Context/Constants"
import { FirebaseContext } from "Components/Firebase"
import { AppContext } from "Components/AppContext/AppContextHOC"
import { sendMessage } from "./FirebaseHelpers/SendMessage"
import classNames from "classnames"
import GoDown from "../GoDown/GoDown"
import "./MessageInput.scss"

type Props = {
  unreadMessagesAuthRef: string[]
  chatContainerRef: HTMLDivElement
  getContainerRect: () => ContainerRectInterface
}

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"]

const MessageInput: React.FC<Props> = ({ chatContainerRef, getContainerRect, unreadMessagesAuthRef }) => {
  const firebase = useContext(FirebaseContext)
  const context = useContext(ContactsContext)
  const { authUser, errors } = useContext(AppContext)
  const { activeChat, messagesInput, contactsStatus } = context?.state!
  const messageInputData = messagesInput[activeChat.chatKey] || {}
  const contactsStatusData = contactsStatus[activeChat.chatKey] || {}

  const inputRef = useRef<HTMLDivElement>(null!)
  const keysMap = useRef<any>({})

  const windowWidth = window.innerWidth

  const getSelection = () => {
    const selection = window.getSelection()
    const anchorOffset = selection?.anchorOffset!
    return { selection, anchorOffset }
  }

  const handleCursorLine = ({
    node,
    anchorOffset,
    anchorShift = 0
  }: {
    node: any
    anchorOffset: number
    anchorShift?: number
  }) => {
    const { selection } = getSelection()
    const range = document.createRange()
    range.setStart(node, Math.min(anchorOffset + anchorShift, node?.textContent?.length!))
    range.collapse(true)

    selection?.removeAllRanges()
    selection?.addRange(range)
  }

  useLayoutEffect(() => {
    inputRef.current.innerHTML = messageInputData?.message || ""

    if (windowWidth < MOBILE_LAYOUT_THRESHOLD) return
    if (!inputRef.current.innerHTML && windowWidth > MOBILE_LAYOUT_THRESHOLD) {
      inputRef.current.focus()
    } else {
      handleCursorLine({ node: inputRef.current.childNodes[0], anchorOffset: messageInputData.anchorOffset! })
      inputRef.current.scrollTop = messageInputData.scrollTop!
    }
    return () => {
      dispatchDeb.flush()
    }
  }, [activeChat])

  const dispatchDeb = useCallback(
    debounce((payload: MessageInputInterface) => context?.dispatch({ type: "updateMessageInput", payload }), 100),
    []
  )

  const onClick = () => {
    const { anchorOffset } = getSelection()
    console.log("onClick: anchorOffset")
    dispatchDeb({ anchorOffset })
  }

  const scrollPositionHandler = () => {
    const { scrollTop } = inputRef.current
    console.log("scroll: scrollTop")
    dispatchDeb({ scrollTop })
  }

  const handleSendMessage = async () => {
    if (["", "\n"].includes(inputRef.current?.textContent!)) return
    if (windowWidth < MOBILE_LAYOUT_THRESHOLD) {
      inputRef.current.focus()
    }

    const newMessageText = inputRef.current.innerHTML

    inputRef.current.innerHTML = ""
    context?.dispatch({ type: "updateMessageInput", payload: { message: "", anchorOffset: 0, scrollTop: 0 } })

    try {
      const messageKey = await sendMessage({
        activeChat,
        authUser,
        firebase,
        message: newMessageText,
        contactsStatusData
      })

      const newMessageRef = document.querySelector(`.chat-window__message--${messageKey}`)
      newMessageRef?.scrollIntoView({ block: "start", inline: "start" })
    } catch (error) {
      const timeStampEpoch = new Date().getTime()
      const newMessage: MessageInterface = {
        message: newMessageText,
        sender: authUser?.uid!,
        timeStamp: timeStampEpoch,
        key: timeStampEpoch.toString(),
        isDelivered: false
      }
      context?.dispatch({ type: "addNewMessage", payload: { newMessage, chatKey: activeChat.chatKey } })

      const newMessageRef = document.querySelector(`.chat-window__message--${timeStampEpoch.toString()}`)
      newMessageRef?.scrollIntoView({ block: "start", inline: "start" })

      errors.handleError({
        message: "Message hasn't been sent, because of the unexpected error. Please reload the page."
      })
    } finally {
      console.log("sendMessage: all to zero")
      // inputRef.current.innerHTML = ""
      // context?.dispatch({ type: "updateMessageInput", payload: { message: "", anchorOffset: 0, scrollTop: 0 } })
    }
  }

  const handleOnChange = (e: any) => {
    const { innerHTML, textContent } = e.currentTarget
    const { anchorOffset } = getSelection()
    const scrollTop = inputRef.current.scrollTop
    if (["", "\n"].includes(textContent)) {
      console.log("onChangeEmpty: all to zero")
      e.currentTarget.innerHTML = ""
      dispatchDeb({ message: "", anchorOffset: 0, scrollTop: 0 })
    } else {
      console.log("onChangeNotEmpty: all")
      dispatchDeb({ message: innerHTML, anchorOffset, scrollTop })
    }
  }

  const prevHeight = useRef(0)
  const handleNextLine = ({ textContent, innerHTML, e }: { textContent: string; innerHTML: string; e: any }) => {
    const { anchorOffset } = getSelection()
    const { scrollTop } = inputRef.current
    const height = inputRef.current.getBoundingClientRect().height

    if (textContent === "") {
      e.currentTarget.innerHTML = ""
      return
    }

    const lastIndexBr = innerHTML.lastIndexOf("\n")

    if (lastIndexBr === -1 || lastIndexBr < innerHTML.length - 1) {
      if (anchorOffset === innerHTML.length) {
        // No "\n" at all or it's somewhere, BUT not at the end, which means two "\n" needed to be add
        e.currentTarget.innerHTML = `${innerHTML}\n\n`
      } else {
        e.currentTarget.innerHTML = `${innerHTML.slice(0, anchorOffset)}\n${innerHTML.slice(anchorOffset)}`
      }
    } else {
      if (anchorOffset === innerHTML.length) {
        // "\n" at the end, which means only one "\n" needed to be add
        e.currentTarget.innerHTML = `${innerHTML}\n`
      } else {
        e.currentTarget.innerHTML = `${innerHTML.slice(0, anchorOffset)}\n${innerHTML.slice(anchorOffset!)}`
      }
    }

    handleCursorLine({ node: e.currentTarget.childNodes[0], anchorOffset, anchorShift: 1 })
    inputRef.current.scrollTop = scrollTop + MESSAGE_LINE_HEIGHT
    if (prevHeight.current + MESSAGE_LINE_HEIGHT < INPUT_MESSAGE_MAX_HEIGHT) {
      chatContainerRef.scrollTop = getContainerRect().scrollTop + MESSAGE_LINE_HEIGHT
    }
    prevHeight.current = height
  }

  const handleKeyDown = async (e: any) => {
    const { innerHTML, textContent } = e.currentTarget

    keysMap.current[e.key] = e.type === "keydown"
    if (e.which === 32 && textContent === "") {
      e.preventDefault()
      e.currentTarget.innerHTML = ""
    }
    if (e.key === "Enter") {
      e.preventDefault()
      if (e.currentTarget.innerHTML === "") return
      if (keysMap.current.Shift) {
        handleNextLine({ textContent, innerHTML, e })
      } else {
        handleSendMessage()
      }
    }
  }

  const handleKeyUp = (e: any) => {
    const { innerHTML } = e.currentTarget
    const { anchorOffset } = getSelection()
    const scrollTop = inputRef.current.scrollTop
    if (arrowKeys.includes(e.key)) {
      console.log("keyUpArrows: anchorOffset")
      dispatchDeb({ anchorOffset, scrollTop })
    }
    if (e.key === "Enter") {
      e.preventDefault()
      console.log(keysMap.current.Shift)
      if (keysMap.current.Shift) {
        dispatchDeb({ message: innerHTML, anchorOffset, scrollTop })
      }
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
          autoCorrect="off"
        ></div>
      </div>
      <div
        className={classNames("chat-window__send-message", {
          "chat-window__send-message--fade-in": !!messageInputData?.message?.length
        })}
      >
        <button className="chat-window__send-message-btn" type="button" onClick={() => handleSendMessage()}></button>
      </div>
      <GoDown
        chatContainerRef={chatContainerRef}
        chatKey={activeChat.chatKey}
        unreadMessagesAuthRef={unreadMessagesAuthRef}
        getContainerRect={getContainerRect}
      />
    </div>
  )
}

export default MessageInput
