import { ContactsInterface, ContactsStateInterface, MessageInterface } from "../../Types"
import { MESSAGES_TO_RENDER } from "./Constants"

export type ACTIONTYPES =
  | { type: "updateContactUnreadMessages"; payload: string[] }
  | { type: "updateAuthUserUnreadMessages"; payload: number | null }
  | { type: "updateActiveChat"; payload: { chatKey: string; contactKey: string } }
  | {
      type: "setInitialMessages"
      payload: { messagesData: MessageInterface[]; loadedMessages?: number; chatKey: string }
    }
  | { type: "loadTopMessages"; payload: { newTopMessages: MessageInterface[] } }
  | { type: "updateRenderedMessages"; payload: { messagesToRender: number } }
  | { type: "renderTopMessages"; payload: { messagesToRender: number } }
  | { type: "addNewMessage"; payload: { newMessage: MessageInterface; chatKey: string } }
  | { type: "removeMessage"; payload: { removedMessage: MessageInterface; chatKey: string } }
  | { type: "changeMessage"; payload: { changedMessage: MessageInterface; chatKey: string } }
  | { type: "updateContacts"; payload: ContactsInterface }
  | { type: "updateLastScrollTop"; payload: { scrollTop: number; chatKey: string } }
  | { type: "updateMessagePopup"; payload: string }
  | { type: "updateContactPopup"; payload: string }

const reducer = (state: ContactsStateInterface, action: ACTIONTYPES) => {
  const {
    contactsUnreadMessages,
    activeChat,
    messages,
    renderedMessages,
    renderedMessagesList,
    messagePopup,
    contactPopup,
    lastScrollTop
  } = state
  switch (action.type) {
    case "setInitialMessages":
      console.log(action.payload.loadedMessages)
      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: action.payload.messagesData
        },
        renderedMessages: {
          ...renderedMessages,
          [action.payload.chatKey]: action.payload.loadedMessages
        },
        renderedMessagesList: {
          ...renderedMessagesList,
          [action.payload.chatKey]: action.payload.messagesData.slice(50, action.payload.loadedMessages)
        }
      }

    case "loadTopMessages":
      return {
        ...state,
        messages: {
          ...messages,
          [activeChat.chatKey]: [...action.payload.newTopMessages, ...messages[activeChat.chatKey]]
        }
        // renderedMessagesList: {
        //   ...renderedMessagesList,
        //   [activeChat.chatKey]: [...action.payload.newTopMessages, ...messages[activeChat.chatKey]].slice(75, 125)
        // }

        // renderedMessages: {
        //   ...renderedMessages,
        //   [activeChat.chatKey]: 0
        // },
        // renderedMessagesList: {
        //   ...renderedMessagesList,
        //   [activeChat.chatKey]: [...action.payload.newTopMessages, ...messages[activeChat.chatKey]].slice(0, 50)
        // }
      }

    case "renderTopMessages":
      console.log(renderedMessages[activeChat.chatKey])
      // const lastRenderedMessage = renderedMessages[activeChat.chatKey]! <= 0 ? 25 : renderedMessages[activeChat.chatKey]
      if (messages[activeChat.chatKey][0].key === renderedMessagesList[activeChat.chatKey][0].key) {
        return { ...state }
      }

      const indexStart = messages[activeChat.chatKey].findIndex(
        (item: any) => item.key === renderedMessagesList[activeChat.chatKey][0].key
      )
      const indexEnd = messages[activeChat.chatKey].findIndex(
        (item: any) =>
          item.key === renderedMessagesList[activeChat.chatKey][renderedMessagesList[activeChat.chatKey].length - 1].key
      )

      console.log({ indexStart })
      console.log({ indexEnd })
      console.log(messages[activeChat.chatKey])

      return {
        ...state,
        // renderedMessages: {
        //   ...renderedMessages,
        //   [activeChat.chatKey]:
        //     lastRenderedMessage! - MESSAGES_TO_RENDER <= 0 ? 0 : lastRenderedMessage! - MESSAGES_TO_RENDER
        // },
        renderedMessagesList: {
          ...renderedMessagesList,
          [activeChat.chatKey]: messages[activeChat.chatKey].slice(
            indexStart - 25 <= 0 ? 0 : indexStart - 25,
            indexEnd - 25 <= 50 ? 50 : indexEnd - 25
          )
        }
      }

    case "updateRenderedMessages":
      if (renderedMessages[activeChat.chatKey]! >= messages[activeChat.chatKey]?.length) {
        return { ...state }
      }
      console.log("updateRenderedMessages")
      // const lastRenderedMessageTest =
      //   renderedMessages[activeChat.chatKey]! <= 0 ? 25 : renderedMessages[activeChat.chatKey]
      const indexStartt = messages[activeChat.chatKey].findIndex(
        (item: any) => item.key === renderedMessagesList[activeChat.chatKey][0].key
      )
      const indexEndd = messages[activeChat.chatKey].findIndex(
        (item: any) =>
          item.key === renderedMessagesList[activeChat.chatKey][renderedMessagesList[activeChat.chatKey].length - 1].key
      )
      // if (
      //   messages[activeChat.chatKey][indexEndd].key ===
      //   renderedMessagesList[activeChat.chatKey][renderedMessagesList[activeChat.chatKey].length - 1].key
      // ) {
      //   return { ...state }
      // }
      return {
        ...state,
        // renderedMessages: {
        //   ...renderedMessages,
        //   [activeChat.chatKey]: lastRenderedMessageTest! + action.payload.messagesToRender
        // },
        renderedMessagesList: {
          ...renderedMessagesList,
          [activeChat.chatKey]: messages[activeChat.chatKey].slice(
            indexStartt + 25 <= 0 ? 0 : indexStartt + 25,
            indexEndd + 25 <= 50 ? 50 : indexEndd + 25
          )
        }
      }

    case "addNewMessage":
      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: [...messages[action.payload.chatKey], action.payload.newMessage]
        }
      }

    case "removeMessage":
      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: [
            ...messages[action.payload.chatKey].filter((message) => message.key !== action.payload.removedMessage.key)
          ]
        }
      }

    case "changeMessage":
      const prevStateMessages = [...messages[action.payload.chatKey]]
      const changedMessageIndex = prevStateMessages.findIndex(
        (message) => message.key === action.payload.changedMessage.key
      )

      prevStateMessages[changedMessageIndex] =
        changedMessageIndex !== -1 ? action.payload.changedMessage : prevStateMessages[changedMessageIndex]

      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: prevStateMessages
        }
      }

    case "updateContacts":
      return {
        ...state,
        contacts: action.payload
      }

    case "updateLastScrollTop":
      console.log(activeChat.chatKey)
      console.log(action.payload.chatKey)
      if (activeChat.chatKey !== action.payload.chatKey) {
        return { ...state }
      }
      return {
        ...state,
        lastScrollTop: {
          ...lastScrollTop,
          [activeChat.chatKey]: action.payload.scrollTop
        }
      }

    case "updateContactUnreadMessages":
      return {
        ...state,
        contactsUnreadMessages: {
          ...contactsUnreadMessages,
          [activeChat.chatKey]: action.payload
        }
      }

    case "updateAuthUserUnreadMessages":
      return {
        ...state,
        authUserUnreadMessages: action.payload
      }

    case "updateActiveChat":
      return {
        ...state,
        activeChat: action.payload
      }

    case "updateMessagePopup":
      return {
        ...state,
        messagePopup: messagePopup === action.payload ? "" : action.payload
      }

    case "updateContactPopup":
      return {
        ...state,
        contactPopup: contactPopup === action.payload ? "" : action.payload
      }

    default:
      throw new Error()
  }
}

export const INITIAL_STATE = {
  authUserUnreadMessages: null,
  contactsUnreadMessages: {},
  activeChat: {
    chatKey: "",
    contactKey: ""
  },
  messages: {},
  renderedMessages: {},
  renderedMessagesList: {},
  contacts: {},
  lastScrollTop: {},
  messagePopup: "",
  contactPopup: ""
}

export default reducer
