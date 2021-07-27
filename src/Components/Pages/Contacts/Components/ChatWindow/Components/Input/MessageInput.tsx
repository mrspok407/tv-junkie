import { ContainerRectInterface, MessageInputInterface, MessageInterface } from "Components/Pages/Contacts/@Types"
import React, { useEffect, useRef, useCallback, useLayoutEffect } from "react"
import debounce from "debounce"
import { MESSAGE_LINE_HEIGHT, MOBILE_LAYOUT_THRESHOLD } from "../../../@Context/Constants"
import classNames from "classnames"
import GoDown from "../GoDown/GoDown"
import { updateTyping } from "./FirebaseHelpers/UpdateTyping"
import SelectOptions from "../SelectOptions/SelectOptions"
import useHandleMessage from "./Hooks/UseHandleMessage"
import useInputResizeObserver from "./Hooks/UseInputResizeObserver"
import striptags from "striptags"
import { textToUrl } from "Utils"
import useFrequentVariables from "Components/Pages/Contacts/Hooks/UseFrequentVariables"
import "./MessageInput.scss"

type Props = {
  unreadMessagesAuthRef: string[]
  chatContainerRef: HTMLDivElement
  getContainerRect: () => ContainerRectInterface
  contactLastActivity: { timeStamp: number; key: string }
}

const arrowKeys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"]
const debounceTimeout = 100

const MessageInput: React.FC<Props> = ({
  chatContainerRef,
  getContainerRect,
  unreadMessagesAuthRef,
  contactLastActivity
}) => {
  const { firebase, authUser, errors, contactsState, contactsDispatch } = useFrequentVariables()
  const { activeChat, messagesInput, messages, selectedMessages, contacts } = contactsState
  const contactInfo = contacts[activeChat.contactKey]
  const selectedMessagesData = selectedMessages[activeChat.chatKey]
  const messageInputData = messagesInput[activeChat.chatKey] || {}
  const messagesData = messages[activeChat.chatKey]

  const inputRef = useRef<HTMLDivElement>(null!)
  const keysMap = useRef<any>({})

  const windowWidth = window.innerWidth

  const { sendMessage, sendMessageGroupChat, editMessagePrivateChat, editMessageGroupChat } = useHandleMessage({
    contactLastActivity
  })
  useInputResizeObserver({ inputRef: inputRef.current, chatContainerRef: chatContainerRef, getContainerRect })

  const getSelection = () => {
    const selection = window.getSelection()!
    const anchorOffset = selection?.anchorOffset!
    const focusOffset = selection?.focusOffset!
    return { selection, anchorOffset, focusOffset }
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
      updateInputDeb.flush()
    }
  }, [activeChat]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateInputDeb = useCallback(
    debounce((payload: MessageInputInterface) => {
      contactsDispatch({ type: "updateMessageInput", payload })
    }, debounceTimeout),
    [activeChat]
  )

  const onClick = () => {
    const { anchorOffset } = getSelection()
    updateInputDeb({ anchorOffset })
  }

  const onPaste = (e: any) => {
    e.preventDefault()
    const { selection, anchorOffset, focusOffset } = getSelection()
    selection.deleteFromDocument()

    const data = striptags(e.clipboardData.getData("text/plain"))
    const innerHTML = e.currentTarget.innerHTML
    const anchor = Math.min(anchorOffset, focusOffset)

    if (e.currentTarget.innerHTML === "") {
      e.currentTarget.innerHTML = data
    } else {
      e.currentTarget.innerHTML = `${innerHTML.slice(0, anchor)}${data}${innerHTML.slice(anchor)}`
    }
    updateInputDeb({ message: e.currentTarget.innerHTML, anchorOffset: anchor })
    handleCursorLine({ node: e.currentTarget.childNodes[0], anchorOffset: anchor, anchorShift: data.length })
  }

  const scrollPositionHandler = () => {
    const { scrollTop } = inputRef.current
    updateInputDeb({ scrollTop })
  }

  const handleSendMessage = async () => {
    if (["", "\n"].includes(inputRef.current?.textContent!)) return
    if (windowWidth < MOBILE_LAYOUT_THRESHOLD) {
      inputRef.current.focus()
    }

    const newMessageText = textToUrl({ text: inputRef.current.innerHTML })
    inputRef.current.innerHTML = ""

    updateInputDeb.clear()
    contactsDispatch({
      type: "updateMessageInput",
      payload: { message: "", anchorOffset: 0, scrollTop: 0, editingMsgKey: null }
    })

    try {
      let messageKey: string
      if (!contactInfo?.isGroupChat) {
        messageKey = await sendMessage({ message: newMessageText })
      } else {
        messageKey = await sendMessageGroupChat({ message: newMessageText })
      }

      const newMessageRef = document.querySelector(`.chat-window__message--${messageKey}`)
      console.log({ newMessageRef })
      newMessageRef?.scrollIntoView({ block: "start", inline: "start" })
    } catch (error) {
      const timeStampEpoch = new Date().getTime()
      const newMessage: MessageInterface = {
        message: newMessageText,
        sender: authUser?.uid!,
        userName: contactInfo?.isGroupChat ? authUser?.username : "",
        timeStamp: timeStampEpoch,
        key: timeStampEpoch.toString(),
        isDelivered: false
      }
      contactsDispatch({
        type: "addNewMessage",
        payload: { newMessage, chatKey: activeChat.chatKey, authUser }
      })

      const newMessageRef = document.querySelector(`.chat-window__message--${timeStampEpoch.toString()}`)
      newMessageRef?.scrollIntoView({ block: "start", inline: "start" })

      errors.handleError({
        message: "Message hasn't been sent, because of the unexpected error. Please reload the page."
      })
    }
  }

  const handleEditMessage = async () => {
    if (["", "\n"].includes(inputRef.current?.textContent!)) return

    const editedMessageText = textToUrl({ text: inputRef.current.innerHTML })
    const originalMessage = messagesData.find((message) => message.key === messageInputData.editingMsgKey)!
    inputRef.current.innerHTML = ""

    updateInputDeb.clear()
    contactsDispatch({
      type: "updateMessageInput",
      payload: { message: "", anchorOffset: 0, scrollTop: 0, editingMsgKey: null }
    })

    try {
      if (contactInfo.isGroupChat) {
        await editMessageGroupChat({ message: editedMessageText, originalMessage })
      } else {
        await editMessagePrivateChat({ message: editedMessageText, originalMessage })
      }
    } catch (error) {
      errors.handleError({
        message: "Message hasn't been edited, because of the unexpected error. Please reload the page."
      })
    }
  }

  const handleOnChange = (e: any) => {
    const { innerHTML, textContent } = e.currentTarget
    const { anchorOffset } = getSelection()
    const scrollTop = inputRef.current.scrollTop

    if (["", "\n"].includes(textContent)) {
      e.currentTarget.innerHTML = ""
      updateInputDeb({ message: "", anchorOffset: 0, scrollTop: 0, editingMsgKey: null })
      updateTyping({ activeChat, authUser, firebase, setTypingNull: true, isGroupChat: contactInfo?.isGroupChat })
    } else {
      updateInputDeb({ message: innerHTML, anchorOffset, scrollTop })
      updateTyping({ activeChat, authUser, firebase, isGroupChat: contactInfo?.isGroupChat })
    }
  }

  const handleNextLine = ({ textContent, innerHTML, e }: { textContent: string; innerHTML: string; e: any }) => {
    const { anchorOffset } = getSelection()
    const { scrollTop } = inputRef.current

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
        if (!messageInputData.editingMsgKey) {
          handleSendMessage()
        } else {
          handleEditMessage()
        }
      }
    }
  }

  const handleKeyUp = (e: any) => {
    const { innerHTML } = e.currentTarget
    const { anchorOffset } = getSelection()
    const scrollTop = inputRef.current.scrollTop
    if (arrowKeys.includes(e.key)) {
      updateInputDeb({ anchorOffset, scrollTop })
    }
    if (e.key === "Enter") {
      e.preventDefault()
      if (keysMap.current.Shift) {
        updateInputDeb({ message: innerHTML, anchorOffset, scrollTop })
      }
    }
    keysMap.current[e.key] = e.type === "keydown"
  }

  useEffect(() => {
    const inputNode = inputRef.current
    inputNode.addEventListener("scroll", scrollPositionHandler)
    return () => {
      inputNode.removeEventListener("scroll", scrollPositionHandler)
    }
  }, [activeChat]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="chat-window__input-wrapper">
      {selectedMessagesData?.length ? <SelectOptions /> : ""}
      <div className="chat-window__input-message-container">
        <div
          ref={inputRef}
          onPaste={onPaste}
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
        <button
          className="chat-window__send-message-btn"
          type="button"
          onClick={() => {
            if (!messageInputData.editingMsgKey) {
              handleSendMessage()
            } else {
              handleEditMessage()
            }
          }}
        ></button>
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
