import {
  ContactInfoInterface,
  ContactsInterface,
  ContactsStateInterface,
  ContactStatusInterface,
  MessageInputInterface,
  MessageInterface
} from "../../@Types"
import { MESSAGES_TO_RENDER, UNREAD_MESSAGES_TO_RENDER } from "./Constants"
import * as _isEqual from "lodash.isequal"

export type ACTIONTYPES =
  | { type: "updateContactUnreadMessages"; payload: { unreadMessages: string[]; chatKey: string } }
  | { type: "updateAuthUserUnreadMessages"; payload: { chatKey: string; unreadMessages: string[] } }
  | { type: "updateActiveChat"; payload: { chatKey: string; contactKey: string } }
  | { type: "updateMessagesListRef"; payload: { ref: any } }
  | {
      type: "setInitialMessages"
      payload: { messagesData: MessageInterface[]; startIndex?: number; endIndex?: number; chatKey: string }
    }
  | { type: "removeAllMessages"; payload: { chatKey: string } }
  | { type: "renderMessagesOnLoad"; payload: { startIndex?: number; endIndex?: number; chatKey: string } }
  | { type: "loadTopMessages"; payload: { newTopMessages: MessageInterface[] } }
  | { type: "renderTopMessages" }
  | { type: "renderBottomMessages" }
  | { type: "handleGoDown"; payload: { unreadMessages: string[] } }
  | { type: "addNewMessage"; payload: { newMessage: MessageInterface; chatKey: string } }
  | { type: "removeMessages"; payload: { removedMessages: MessageInterface[]; chatKey: string } }
  | { type: "changeMessage"; payload: { changedMessage: MessageInterface; chatKey: string } }
  | { type: "updateSelectedMessages"; payload: { messageKey: string; chatKey: string } }
  | { type: "clearSelectedMessages"; payload: { chatKey: string } }
  | { type: "updateMessageInput"; payload: MessageInputInterface }
  | { type: "updateContactInfo"; payload: { changedInfo: ContactInfoInterface } }
  | {
      type: "updateContactsInitial"
      payload: {
        contacts: ContactsInterface
        unreadMessages: { [key: string]: string[] }
        unreadMessagesContacts: { [key: string]: string[] }
      }
    }
  | { type: "updateContacts"; payload: { contacts: ContactInfoInterface[] } }
  | { type: "updateLastScrollPosition"; payload: { scrollTop: number; chatKey: string } }
  | { type: "updateMessagePopup"; payload: string }
  | { type: "updateOptionsPopupContactList"; payload: string }
  | { type: "updateOptionsPopupChatWindow"; payload: string }
  | { type: "closePopups"; payload: string }
  | { type: "updateConfirmModal"; payload: { isActive: boolean; function: string; contactKey?: string } }
  | { type: "updateContactsStatus"; payload: { status: ContactStatusInterface; chatKey: string } }
  | { type: "updateContactsPageIsOpen"; payload: { isPageOpen: boolean | null; chatKey: string } }

const reducer = (state: ContactsStateInterface, action: ACTIONTYPES) => {
  const {
    contactsUnreadMessages,
    authUserUnreadMessages,
    activeChat,
    messages,
    selectedMessages,
    messagesInput,
    renderedMessagesList,
    messagePopup,
    optionsPopupContactList,
    optionsPopupChatWindow,
    lastScrollPosition,
    contactsStatus,
    contacts
  } = state

  switch (action.type) {
    case "setInitialMessages":
      const { startIndex, endIndex } = action.payload
      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: action.payload.messagesData
        },
        renderedMessagesList: {
          ...renderedMessagesList,
          [action.payload.chatKey]: action.payload.messagesData.slice(startIndex, endIndex)
        }
      }

    case "removeAllMessages":
      console.log("removeAllMessages")
      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: []
        },
        renderedMessagesList: {
          ...renderedMessagesList,
          [action.payload.chatKey]: []
        },
        authUserUnreadMessages: {
          ...authUserUnreadMessages,
          [action.payload.chatKey]: []
        }
      }

    case "loadTopMessages":
      return {
        ...state,
        messages: {
          ...messages,
          [activeChat.chatKey]: [...action.payload.newTopMessages, ...messages[activeChat.chatKey]]
        }
      }

    case "renderTopMessages": {
      console.log(messages[activeChat.chatKey])
      console.log(renderedMessagesList[activeChat.chatKey][0])
      if (messages[activeChat.chatKey][0]?.key === renderedMessagesList[activeChat.chatKey][0]?.key) {
        return { ...state }
      }

      const indexStart = Math.max(
        messages[activeChat.chatKey].findIndex((item) => item.key === renderedMessagesList[activeChat.chatKey][0].key) -
          (MESSAGES_TO_RENDER - (MESSAGES_TO_RENDER - 25)),
        0
      )
      const indexEnd = indexStart + MESSAGES_TO_RENDER

      return {
        ...state,
        renderedMessagesList: {
          ...renderedMessagesList,
          [activeChat.chatKey]: messages[activeChat.chatKey].slice(indexStart, indexEnd)
        }
      }
    }

    case "renderBottomMessages": {
      const messagesData = messages[activeChat.chatKey]
      const renderedMessages = renderedMessagesList[activeChat.chatKey]

      if (messagesData[messagesData.length - 1].key === renderedMessages[renderedMessages.length - 1].key) {
        return { ...state }
      }

      const indexEnd = Math.min(
        Math.max(
          messagesData.findIndex((item) => item.key === renderedMessages[renderedMessages.length - 1].key) +
            (MESSAGES_TO_RENDER - (MESSAGES_TO_RENDER - 25)),
          MESSAGES_TO_RENDER
        ),
        messagesData.length
      )
      const indexStart = indexEnd - MESSAGES_TO_RENDER

      return {
        ...state,
        renderedMessagesList: {
          ...renderedMessagesList,
          [activeChat.chatKey]: messages[activeChat.chatKey].slice(indexStart, indexEnd)
        }
      }
    }

    case "handleGoDown": {
      const messagesData = messages[activeChat.chatKey]
      const renderedMessages = renderedMessagesList[activeChat.chatKey].map((message) => message.key)
      const unreadMessages = action.payload.unreadMessages

      if (!action.payload.unreadMessages.length) {
        return {
          ...state,
          renderedMessagesList: {
            ...renderedMessagesList,
            [activeChat.chatKey]: messagesData.slice(-MESSAGES_TO_RENDER)
          },
          authUserUnreadMessages: {
            ...authUserUnreadMessages,
            [activeChat.chatKey]: []
          }
        }
      } else {
        if (action.payload.unreadMessages.some((message) => renderedMessages.includes(message))) {
          return {
            ...state,
            renderedMessagesList: {
              ...renderedMessagesList,
              [activeChat.chatKey]: messagesData.slice(-MESSAGES_TO_RENDER)
            },
            authUserUnreadMessages: {
              ...authUserUnreadMessages,
              [activeChat.chatKey]: []
            }
          }
        } else {
          const endIndex = messagesData.length - Math.max(unreadMessages.length! - UNREAD_MESSAGES_TO_RENDER, 0)
          const startIndex = Math.max(endIndex - MESSAGES_TO_RENDER, 0)
          return {
            ...state,
            renderedMessagesList: {
              ...renderedMessagesList,
              [activeChat.chatKey]: messagesData.slice(startIndex, endIndex)
            }
          }
        }
      }
    }

    case "renderMessagesOnLoad":
      return {
        ...state,
        renderedMessagesList: {
          ...renderedMessagesList,
          [action.payload.chatKey]: messages[action.payload.chatKey].slice(
            action.payload.startIndex,
            action.payload.endIndex
          )
        }
      }

    case "addNewMessage": {
      const messagesData = messages[action.payload.chatKey]
      const lastMessage = messagesData[messagesData.length - 1]
      const renderedMessages = renderedMessagesList[action.payload.chatKey]
      const lastRenderedMessage = renderedMessages[renderedMessages.length - 1]
      const unreadMessages = authUserUnreadMessages[action.payload.chatKey] || []

      if (activeChat.chatKey !== action.payload.chatKey) {
        if (!lastMessage || !lastRenderedMessage) {
          return {
            ...state,
            messages: {
              ...messages,
              [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
            },
            renderedMessagesList: {
              ...renderedMessagesList,
              [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
            },
            authUserUnreadMessages: {
              ...authUserUnreadMessages,
              [action.payload.chatKey]: [...unreadMessages, action.payload.newMessage.key]
            }
          }
        }
        if (lastMessage.key !== lastRenderedMessage.key) {
          return {
            ...state,
            messages: {
              ...messages,
              [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
            },
            authUserUnreadMessages: {
              ...authUserUnreadMessages,
              [action.payload.chatKey]: [...unreadMessages, action.payload.newMessage.key]
            }
          }
        } else {
          const endIndexRender =
            [...messagesData, action.payload.newMessage].length -
            (authUserUnreadMessages[action.payload.chatKey].length! - UNREAD_MESSAGES_TO_RENDER)
          const startIndexRender = Math.max(endIndexRender - MESSAGES_TO_RENDER, 0)
          return {
            ...state,
            messages: {
              ...messages,
              [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
            },
            renderedMessagesList: {
              ...renderedMessagesList,
              [action.payload.chatKey]: [...messagesData, action.payload.newMessage].slice(
                startIndexRender,
                endIndexRender
              )
            },
            authUserUnreadMessages: {
              ...authUserUnreadMessages,
              [action.payload.chatKey]: [...unreadMessages, action.payload.newMessage.key]
            },
            lastScrollPosition: {
              ...lastScrollPosition,
              [action.payload.chatKey]: undefined
            }
          }
        }
      } else {
        if (!lastMessage || !lastRenderedMessage) {
          return {
            ...state,
            messages: {
              ...messages,
              [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
            },
            renderedMessagesList: {
              ...renderedMessagesList,
              [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
            },
            authUserUnreadMessages: {
              ...authUserUnreadMessages,
              [action.payload.chatKey]: [...unreadMessages, action.payload.newMessage.key]
            }
          }
        }
        if (lastMessage.key !== lastRenderedMessage.key) {
          return {
            ...state,
            messages: {
              ...messages,
              [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
            },
            authUserUnreadMessages: {
              ...authUserUnreadMessages,
              [action.payload.chatKey]: [...unreadMessages, action.payload.newMessage.key]
            }
          }
        } else {
          if (authUserUnreadMessages[action.payload.chatKey].length! <= UNREAD_MESSAGES_TO_RENDER) {
            return {
              ...state,
              messages: {
                ...messages,
                [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
              },
              renderedMessagesList: {
                ...renderedMessagesList,
                [action.payload.chatKey]: [...messagesData, action.payload.newMessage].slice(-MESSAGES_TO_RENDER)
              },
              authUserUnreadMessages: {
                ...authUserUnreadMessages,
                [action.payload.chatKey]: [...unreadMessages, action.payload.newMessage.key]
              }
            }
          } else {
            const endIndexRender =
              [...messagesData, action.payload.newMessage].length -
              (authUserUnreadMessages[action.payload.chatKey].length! - UNREAD_MESSAGES_TO_RENDER)
            const startIndexRender = Math.max(endIndexRender - MESSAGES_TO_RENDER, 0)
            return {
              ...state,
              messages: {
                ...messages,
                [action.payload.chatKey]: [...messagesData, action.payload.newMessage]
              },
              renderedMessagesList: {
                ...renderedMessagesList,
                [action.payload.chatKey]: [...messagesData, action.payload.newMessage].slice(
                  startIndexRender,
                  endIndexRender
                )
              },
              authUserUnreadMessages: {
                ...authUserUnreadMessages,
                [action.payload.chatKey]: [...unreadMessages, action.payload.newMessage.key]
              }
            }
          }
        }
      }
    }

    case "removeMessages": {
      const messagesData = messages[action.payload.chatKey]
      if (!messagesData.length) {
        return { ...state }
      }
      console.log({ reducerRemovedMessages: action.payload.removedMessages })
      const removedMessagesKeys = action.payload.removedMessages.map((message) => message.key)
      const renderedMessages = renderedMessagesList[action.payload.chatKey]
      const endIndex = messagesData.findIndex(
        (message: MessageInterface) => message.key === renderedMessages[renderedMessages.length - 1].key
      )
      const startIndex = Math.max(endIndex + 1 - MESSAGES_TO_RENDER, 0)
      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: [...messagesData.filter((message) => !removedMessagesKeys.includes(message.key))]
        },
        renderedMessagesList: {
          ...renderedMessagesList,
          [action.payload.chatKey]: [
            ...messagesData
              .filter((message) => !removedMessagesKeys.includes(message.key))
              .slice(startIndex, endIndex + 1)
          ]
        },
        selectedMessages: {
          ...selectedMessages,
          [action.payload.chatKey]: selectedMessages[action.payload.chatKey]?.filter(
            (messageKey) => !removedMessagesKeys.includes(messageKey)
          )
        }
      }
    }

    case "changeMessage":
      const prevStateMessages = [...messages[action.payload.chatKey]]
      const changedMessageIndex = prevStateMessages.findIndex(
        (message) => message.key === action.payload.changedMessage.key
      )
      prevStateMessages[changedMessageIndex] =
        changedMessageIndex !== -1 ? action.payload.changedMessage : prevStateMessages[changedMessageIndex]

      const prevStateRenderedMessages = [...renderedMessagesList[action.payload.chatKey]]
      const changedRenderedMessageIndex = prevStateRenderedMessages.findIndex(
        (message) => message.key === action.payload.changedMessage.key
      )
      prevStateRenderedMessages[changedRenderedMessageIndex] =
        changedRenderedMessageIndex !== -1
          ? action.payload.changedMessage
          : prevStateMessages[changedRenderedMessageIndex]

      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: prevStateMessages
        },
        renderedMessagesList: {
          ...renderedMessagesList,
          [action.payload.chatKey]: prevStateRenderedMessages
        }
      }

    case "updateSelectedMessages": {
      const { messageKey, chatKey } = action.payload
      const messagesData = selectedMessages[chatKey] || []
      const selectedMessagesData = messagesData?.includes(messageKey)
        ? messagesData.filter((key) => key !== messageKey)
        : [...messagesData, messageKey]

      return {
        ...state,
        selectedMessages: {
          ...selectedMessages,
          [chatKey]: selectedMessagesData
        }
      }
    }

    case "clearSelectedMessages": {
      return {
        ...state,
        selectedMessages: {
          ...selectedMessages,
          [action.payload.chatKey]: []
        }
      }
    }

    case "updateMessageInput":
      console.log(action.payload)
      return {
        ...state,
        messagesInput: {
          ...messagesInput,
          [activeChat.chatKey]: {
            ...messagesInput[activeChat.chatKey],
            ...action.payload
          }
        },
        messagePopup: action.payload.editingMsgKey !== null ? "" : messagePopup
      }

    case "updateContactsInitial": {
      return {
        ...state,
        contacts: action.payload.contacts,
        authUserUnreadMessages: action.payload.unreadMessages,
        contactsUnreadMessages: action.payload.unreadMessagesContacts
      }
    }

    case "updateContacts": {
      console.log(contacts)
      console.log(action.payload.contacts)
      action.payload.contacts.reverse()
      const roflan = action.payload.contacts.reduce((acc: any, contact: any) => {
        acc[contact.key] = { ...contacts[contact.key], ...contact }
        return acc
      }, {})

      console.log({ roflan })
      return {
        ...state,
        contacts: roflan
      }
    }

    case "updateContactInfo": {
      const contactsData = { ...contacts }
      if (!contactsData[action.payload.changedInfo.key]) return { ...state }

      contactsData[action.payload.changedInfo.key] = { ...action.payload.changedInfo, ...action.payload.changedInfo }

      return { ...state, contacts: contactsData }
    }

    case "updateLastScrollPosition":
      if (activeChat.chatKey !== action.payload.chatKey) {
        return { ...state }
      }
      return {
        ...state,
        lastScrollPosition: {
          ...lastScrollPosition,
          [action.payload.chatKey]: action.payload.scrollTop
        }
      }

    case "updateContactUnreadMessages":
      console.log(action.payload.unreadMessages)
      return {
        ...state,
        contactsUnreadMessages: {
          ...contactsUnreadMessages,
          [action.payload.chatKey]: action.payload.unreadMessages
        }
      }

    case "updateAuthUserUnreadMessages":
      if (_isEqual(authUserUnreadMessages[action.payload.chatKey]?.sort(), action.payload.unreadMessages?.sort())) {
        return { ...state }
      }

      return {
        ...state,
        authUserUnreadMessages: {
          ...authUserUnreadMessages,
          [action.payload.chatKey]: action.payload.unreadMessages
        }
      }

    case "updateActiveChat":
      return {
        ...state,
        activeChat: action.payload
      }

    case "updateMessagesListRef":
      return {
        ...state,
        messagesListRef: action.payload.ref
      }

    case "updateMessagePopup":
      return {
        ...state,
        messagePopup: messagePopup === action.payload ? "" : action.payload
      }

    case "updateOptionsPopupContactList":
      return {
        ...state,
        optionsPopupContactList: optionsPopupContactList === action.payload ? "" : action.payload
      }

    case "updateOptionsPopupChatWindow":
      return {
        ...state,
        optionsPopupChatWindow: optionsPopupChatWindow === action.payload ? "" : action.payload
      }

    case "closePopups":
      return {
        ...state,
        optionsPopupContactList: "",
        optionsPopupChatWindow: ""
      }

    case "updateContactsStatus":
      return {
        ...state,
        contactsStatus: {
          ...contactsStatus,
          [action.payload.chatKey]: action.payload.status
        }
      }

    case "updateContactsPageIsOpen":
      return {
        ...state,
        contactsStatus: {
          ...contactsStatus,
          [action.payload.chatKey]: {
            ...contactsStatus[action.payload.chatKey],
            pageIsOpen: action.payload.isPageOpen
          }
        }
      }

    case "updateConfirmModal":
      return {
        ...state,
        confirmModal: {
          isActive: action.payload.isActive,
          function: action.payload.function,
          contactKey: action.payload.contactKey
        }
      }

    default:
      throw new Error()
  }
}

export const INITIAL_STATE = {
  authUserUnreadMessages: {},
  contactsUnreadMessages: {},
  activeChat: {
    chatKey: "",
    contactKey: ""
  },
  messages: {},
  selectedMessages: {},
  messagesInput: {},
  renderedMessagesList: {},
  contacts: {},
  lastScrollPosition: {},
  messagePopup: "",
  optionsPopupContactList: "",
  optionsPopupChatWindow: "",
  messagesListRef: "",
  contactsStatus: {},
  confirmModal: {
    isActive: false,
    function: "",
    contactKey: ""
  }
}

export default reducer
