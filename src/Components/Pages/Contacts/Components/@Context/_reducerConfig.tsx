import {
  ContactInfoInterface,
  ContactsInterface,
  ContactsStateInterface,
  ContactStatusInterface,
  MembersStatusGroupChatInterface,
  MessageInputInterface,
  MessageInterface
} from "../../@Types"
import { MESSAGES_TO_RENDER, UNREAD_MESSAGES_TO_RENDER } from "./Constants"
import * as _isEqual from "lodash.isequal"
import * as _assign from "lodash.assign"
import { v4 as uuidv4 } from "uuid"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"

export type ACTIONTYPES =
  | { type: "updateActiveChat"; payload: { chatKey: string; contactKey: string } }
  // Unread Messages //
  | {
      type: "updateContactUnreadMessages"
      payload: { unreadMessages: string[]; chatKey: string }
    }
  | {
      type: "updateAuthUserUnreadMessages"
      payload: { chatKey: string; unreadMessages: string[]; rerenderUnreadMessagesStart?: boolean }
    }
  | { type: "handleGoDown"; payload: { unreadMessages: string[] } }
  | { type: "updateRerenderUnreadMessagesStart" }
  //////
  ////// Messages Handling
  //////
  | {
      type: "setInitialMessages"
      payload: { messagesData: MessageInterface[]; startIndex?: number; endIndex?: number; chatKey: string }
    }
  // Messages Rendering //
  | { type: "renderMessagesOnLoad"; payload: { startIndex?: number; endIndex?: number; chatKey: string } }
  | { type: "loadTopMessages"; payload: { newTopMessages: MessageInterface[] } }
  | { type: "renderTopMessages"; payload: { unreadMessagesAuthRef: string[]; chatKey: string } }
  | { type: "renderBottomMessages"; payload: { unreadMessagesAuthRef: string[]; chatKey: string } }
  // Messages Adding //
  | {
      type: "addNewMessage"
      payload: { newMessage: MessageInterface; chatKey: string; authUser: AuthUserInterface | null }
    }
  // Messages Removing //
  | { type: "removeAllMessages"; payload: { chatKey: string } }
  | { type: "removeMessages"; payload: { removedMessages: MessageInterface[]; chatKey: string } }
  | {
      type: "updateMsgDeletionProcess"
      payload: { messageDeletionProcess: boolean; deletedMessages: MessageInterface[] }
    }
  | { type: "updateMsgDeletionProcessLoading"; payload: { messageDeletionProcess: boolean } }
  // Messages Editing //
  | { type: "editMessage"; payload: { editedMessage: MessageInterface; chatKey: string } }

  // Messages Selection //
  | { type: "updateSelectedMessages"; payload: { messageKey: string; chatKey: string } }
  | { type: "clearSelectedMessages"; payload: { chatKey: string } }

  // Message Input //
  | { type: "updateMessageInput"; payload: MessageInputInterface }

  // Handle Popups //
  | { type: "updateMessagePopup"; payload: string }
  | { type: "updateOptionsPopupContactList"; payload: string }
  | { type: "updateOptionsPopupChatWindow"; payload: string }
  | { type: "closePopups"; payload: string }

  // Contacts Handling //
  | {
      type: "updateContactsInitial"
      payload: {
        contacts: ContactsInterface
        unreadMessages: { [key: string]: string[] }
        unreadMessagesContacts: { [key: string]: string[] }
      }
    }
  | { type: "updateContacts"; payload: { contacts: ContactInfoInterface[] } }

  // Group Chat Handling //
  | {
      type: "updateGroupMembers"
      payload: {
        removeMember: boolean
        newMember: { key: string; username?: string; lastSeen?: number | string | null; chatKey?: string }
      }
    }
  | {
      type: "updateGroupCreation"
      payload: { isActive?: boolean; selectNameActive?: boolean; groupName?: string; error?: string; loading?: boolean }
    }
  | { type: "finishGroupCreation"; payload: { newGroupChatKey: string } }
  | { type: "updateGroupInfoSettings"; payload?: { isActive: boolean } }
  | {
      type: "updateGroupChatParticipants"
      payload: { participants: string[]; chatKey: string }
    }

  // Status Handling //
  | { type: "updateContactsStatus"; payload: { status: ContactStatusInterface; chatKey: string } }
  | {
      type: "updateGroupChatMembersStatus"
      payload: { membersStatus: MembersStatusGroupChatInterface[]; chatKey: string }
    }

  // Other //
  | { type: "updateLastScrollPosition"; payload: { scrollTop: number; chatKey: string } }
  | { type: "updateConfirmModal"; payload: { isActive: boolean; function: string; contactKey?: string } }
  | { type: "updateContactsPageIsOpen"; payload: { isPageOpen: boolean | null; chatKey: string } }

const reducer = (state: ContactsStateInterface, action: ACTIONTYPES) => {
  const {
    contactsUnreadMessages,
    authUserUnreadMessages,
    activeChat,
    groupCreation,
    messages,
    selectedMessages,
    messagesInput,
    renderedMessagesList,
    messagePopup,
    optionsPopupContactList,
    optionsPopupChatWindow,
    lastScrollPosition,
    contactsStatus,
    chatMembersStatus,
    chatParticipants,
    contacts,
    messageDeletionProcess,
    initialMsgLoadedFinished,
    firebaseListeners,
    groupInfoSettingsActive,
    rerenderUnreadMessagesStart
  } = state

  switch (action.type) {
    case "updateActiveChat": {
      return {
        ...state,
        activeChat: action.payload,
        groupInfoSettingsActive: false
      }
    }

    case "updateContactUnreadMessages": {
      if (messageDeletionProcess) return { ...state }
      return {
        ...state,
        contactsUnreadMessages: {
          ...contactsUnreadMessages,
          [action.payload.chatKey]: action.payload.unreadMessages
        },
        firebaseListeners: {
          ...firebaseListeners,
          contactUnreadMessages: {
            ...firebaseListeners.contactUnreadMessages,
            [action.payload.chatKey]: true
          }
        }
      }
    }

    case "updateAuthUserUnreadMessages": {
      if (_isEqual(authUserUnreadMessages[action.payload.chatKey]?.sort(), action.payload.unreadMessages?.sort())) {
        return { ...state }
      }

      return {
        ...state,
        authUserUnreadMessages: {
          ...authUserUnreadMessages,
          [action.payload.chatKey]: action.payload.unreadMessages
        },
        rerenderUnreadMessagesStart: action.payload.rerenderUnreadMessagesStart ? uuidv4() : rerenderUnreadMessagesStart
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
            },
            rerenderUnreadMessagesStart: messages[activeChat.chatKey][0].key
          }
        } else {
          const endIndex = messagesData.length - Math.max(unreadMessages.length! - UNREAD_MESSAGES_TO_RENDER, 0)
          const startIndex = Math.max(endIndex - MESSAGES_TO_RENDER, 0)
          return {
            ...state,
            renderedMessagesList: {
              ...renderedMessagesList,
              [activeChat.chatKey]: messagesData.slice(startIndex, endIndex)
            },
            authUserUnreadMessages: {
              ...authUserUnreadMessages,
              [activeChat.chatKey]: unreadMessages
            },
            rerenderUnreadMessagesStart: uuidv4()
          }
        }
      }
    }

    case "updateRerenderUnreadMessagesStart": {
      return {
        ...state,
        rerenderUnreadMessagesStart: uuidv4()
      }
    }

    case "setInitialMessages": {
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
        },
        initialMsgLoadedFinished: [...initialMsgLoadedFinished, action.payload.chatKey]
      }
    }

    case "renderMessagesOnLoad": {
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
    }

    case "loadTopMessages": {
      return {
        ...state,
        messages: {
          ...messages,
          [activeChat.chatKey]: [...action.payload.newTopMessages, ...messages[activeChat.chatKey]]
        }
      }
    }

    case "renderTopMessages": {
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
        },
        authUserUnreadMessages: {
          ...authUserUnreadMessages,
          [action.payload.chatKey]: action.payload.unreadMessagesAuthRef
        },
        rerenderUnreadMessagesStart: !renderedMessagesList[activeChat.chatKey]
          .map((item) => item.key)
          .includes(action.payload.unreadMessagesAuthRef[0])
          ? uuidv4()
          : rerenderUnreadMessagesStart
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

    case "addNewMessage": {
      const messagesData = messages[action.payload.chatKey]
      const lastMessage = messagesData[messagesData.length - 1]
      const renderedMessages = renderedMessagesList[action.payload.chatKey]
      const lastRenderedMessage = renderedMessages[renderedMessages.length - 1]
      const unreadMessages = authUserUnreadMessages[action.payload.chatKey] || []
      const authUser = action.payload.authUser

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
              [action.payload.chatKey]:
                authUser?.uid !== action.payload.newMessage.sender
                  ? [...unreadMessages, action.payload.newMessage.key]
                  : unreadMessages
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
              [action.payload.chatKey]:
                authUser?.uid !== action.payload.newMessage.sender
                  ? [...unreadMessages, action.payload.newMessage.key]
                  : unreadMessages
            }
          }
        } else {
          const endIndexRender =
            [...messagesData, action.payload.newMessage].length - (unreadMessages.length - UNREAD_MESSAGES_TO_RENDER)
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
              [action.payload.chatKey]:
                authUser?.uid !== action.payload.newMessage.sender
                  ? [...unreadMessages, action.payload.newMessage.key]
                  : unreadMessages
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
              [action.payload.chatKey]:
                authUser?.uid !== action.payload.newMessage.sender
                  ? [...unreadMessages, action.payload.newMessage.key]
                  : unreadMessages
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
              [action.payload.chatKey]:
                authUser?.uid !== action.payload.newMessage.sender
                  ? [...unreadMessages, action.payload.newMessage.key]
                  : unreadMessages
            }
          }
        } else {
          if (unreadMessages.length <= UNREAD_MESSAGES_TO_RENDER) {
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
                [action.payload.chatKey]:
                  authUser?.uid !== action.payload.newMessage.sender
                    ? [...unreadMessages, action.payload.newMessage.key]
                    : []
              }
            }
          } else {
            const endIndexRender =
              [...messagesData, action.payload.newMessage].length - (unreadMessages.length! - UNREAD_MESSAGES_TO_RENDER)
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
                [action.payload.chatKey]:
                  authUser?.uid !== action.payload.newMessage.sender
                    ? [...unreadMessages, action.payload.newMessage.key]
                    : unreadMessages
              }
            }
          }
        }
      }
    }

    case "removeAllMessages": {
      const inputRef = document.querySelector(".chat-window__input-message") as HTMLElement
      if (inputRef) inputRef.innerHTML = ""
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
        },
        rerenderUnreadMessagesStart: uuidv4(),
        selectedMessages: {
          ...selectedMessages,
          [action.payload.chatKey]: []
        },
        messagesInput: {
          ...messagesInput,
          [action.payload.chatKey]: {
            message: "",
            anchorOffset: 0,
            scrollTop: 0,
            editingMsgKey: null
          }
        }
      }
    }

    case "removeMessages": {
      const messagesData = messages[action.payload.chatKey]
      if (!messagesData.length) {
        return { ...state }
      }
      const removedMessagesKeys = action.payload.removedMessages.map((message) => message.key)
      const renderedMessages = renderedMessagesList[action.payload.chatKey]
      const endIndex = messagesData.findIndex(
        (message: MessageInterface) => message.key === renderedMessages[renderedMessages.length - 1].key
      )
      const startIndex = Math.max(endIndex + 1 - (MESSAGES_TO_RENDER + removedMessagesKeys.length), 0)

      const inputRef = document.querySelector(".chat-window__input-message") as HTMLElement
      let messageInput = {}
      const currentMessageEdit = messagesInput[activeChat.chatKey]?.editingMsgKey
      if (currentMessageEdit && removedMessagesKeys.includes(currentMessageEdit)) {
        messageInput = {
          message: "",
          anchorOffset: 0,
          scrollTop: 0,
          editingMsgKey: null
        }
        if (inputRef) inputRef.innerHTML = ""
      }

      return {
        ...state,
        messages: {
          ...messages,
          [action.payload.chatKey]: [...messagesData.filter((message) => !removedMessagesKeys.includes(message.key))]
        },
        contactsUnreadMessages: {
          ...contactsUnreadMessages,
          [action.payload.chatKey]: contactsUnreadMessages[action.payload.chatKey]?.filter(
            (message) => !removedMessagesKeys.includes(message)
          )
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
        },
        messagesInput: {
          ...messagesInput,
          [action.payload.chatKey]: {
            ...messagesInput[activeChat.chatKey],
            ...messageInput
          }
        }
      }
    }

    case "updateMsgDeletionProcess": {
      const inputRef = document.querySelector(".chat-window__input-message") as HTMLElement
      const deletedMessagesData = action.payload.deletedMessages.map((message) => message.key)
      const currentMessageEdit = messagesInput[activeChat.chatKey]?.editingMsgKey
      let messageInput = {}
      if (currentMessageEdit && deletedMessagesData.includes(currentMessageEdit)) {
        messageInput = {
          message: "",
          anchorOffset: 0,
          scrollTop: 0,
          editingMsgKey: null
        }
        if (inputRef) inputRef.innerHTML = ""
      }

      return {
        ...state,
        messageDeletionProcess: action.payload.messageDeletionProcess,
        messagesInput: {
          ...messagesInput,
          [activeChat.chatKey]: {
            ...messagesInput[activeChat.chatKey],
            ...messageInput
          }
        }
      }
    }

    case "updateMsgDeletionProcessLoading": {
      return {
        ...state,
        messageDeletionProcess: action.payload.messageDeletionProcess
      }
    }

    case "editMessage": {
      const prevStateMessages = [...messages[action.payload.chatKey]]
      const editededMessageIndex = prevStateMessages.findIndex(
        (message) => message.key === action.payload.editedMessage.key
      )
      prevStateMessages[editededMessageIndex] =
        editededMessageIndex !== -1 ? action.payload.editedMessage : prevStateMessages[editededMessageIndex]

      const prevStateRenderedMessages = [...renderedMessagesList[action.payload.chatKey]]
      const changedRenderedMessageIndex = prevStateRenderedMessages.findIndex(
        (message) => message.key === action.payload.editedMessage.key
      )
      prevStateRenderedMessages[changedRenderedMessageIndex] =
        changedRenderedMessageIndex !== -1
          ? action.payload.editedMessage
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

    case "updateMessageInput": {
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
    }

    case "updateMessagePopup": {
      return {
        ...state,
        messagePopup: messagePopup === action.payload ? "" : action.payload
      }
    }

    case "updateOptionsPopupContactList": {
      return {
        ...state,
        optionsPopupContactList: optionsPopupContactList === action.payload ? "" : action.payload
      }
    }

    case "updateOptionsPopupChatWindow": {
      return {
        ...state,
        optionsPopupChatWindow: optionsPopupChatWindow === action.payload ? "" : action.payload
      }
    }

    case "closePopups": {
      return {
        ...state,
        optionsPopupContactList: "",
        optionsPopupChatWindow: ""
      }
    }

    case "updateContactsInitial": {
      const authUnreadMerged = _assign({}, action.payload.unreadMessages, authUserUnreadMessages)
      const contactsUnreadMerged = _assign({}, action.payload.unreadMessagesContacts, contactsUnreadMessages)
      return {
        ...state,
        contacts: action.payload.contacts,
        authUserUnreadMessages: authUnreadMerged,
        contactsUnreadMessages: contactsUnreadMerged
      }
    }

    case "updateContacts": {
      action.payload.contacts.reverse()
      const contactsData = action.payload.contacts.reduce((acc: ContactsInterface, contact: ContactInfoInterface) => {
        acc[contact.key] = { ...contacts[contact.key], ...contact }
        return acc
      }, {})

      const authUserUnreadMessagesData: { [key: string]: string[] } = {}
      const contactsUnreadMessagesData: { [key: string]: string[] } = {}
      Object.values(contactsData || {}).forEach((contact) => {
        authUserUnreadMessagesData[contact.chatKey] = authUserUnreadMessages[contact.chatKey] || []
        contactsUnreadMessagesData[contact.chatKey] = contactsUnreadMessages[contact.chatKey] || []
      })

      return {
        ...state,
        contacts: contactsData,
        authUserUnreadMessages: authUserUnreadMessagesData,
        contactsUnreadMessages: contactsUnreadMessagesData
      }
    }

    case "updateGroupMembers": {
      const newMember = action.payload.newMember
      const currentMembers = groupCreation.members

      if (action.payload.removeMember) {
        return {
          ...state,
          groupCreation: {
            ...groupCreation,
            members: currentMembers.filter((member) => member.key !== newMember.key)
          }
        }
      } else {
        return {
          ...state,
          groupCreation: {
            ...groupCreation,
            members: [...currentMembers, newMember]
          }
        }
      }
    }

    case "updateGroupCreation": {
      return {
        ...state,
        groupCreation: {
          ...groupCreation,
          ...action.payload
        }
      }
    }

    case "finishGroupCreation": {
      return {
        ...state,
        groupCreation: {
          ...INITIAL_STATE.groupCreation
        },
        activeChat: {
          chatKey: action.payload.newGroupChatKey,
          contactKey: action.payload.newGroupChatKey
        },
        contacts: {
          ...contacts,
          [action.payload.newGroupChatKey]: {
            chatKey: action.payload.newGroupChatKey,
            key: action.payload.newGroupChatKey,
            isGroupChat: true
          } as ContactInfoInterface
        },
        groupInfoSettingsActive: false
      }
    }

    case "updateGroupInfoSettings": {
      return {
        ...state,
        groupInfoSettingsActive: !groupInfoSettingsActive
      }
    }

    case "updateGroupChatParticipants": {
      return {
        ...state,
        chatParticipants: {
          ...chatParticipants,
          [action.payload.chatKey]: action.payload.participants
        }
      }
    }

    case "updateContactsStatus": {
      return {
        ...state,
        contactsStatus: {
          ...contactsStatus,
          [action.payload.chatKey]: action.payload.status
        }
      }
    }

    case "updateGroupChatMembersStatus": {
      return {
        ...state,
        chatMembersStatus: {
          ...chatMembersStatus,
          [action.payload.chatKey]: action.payload.membersStatus
        }
      }
    }

    case "updateLastScrollPosition": {
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
    }

    case "updateConfirmModal": {
      return {
        ...state,
        confirmModal: {
          isActive: action.payload.isActive,
          function: action.payload.function,
          contactKey: action.payload.contactKey
        }
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
  groupCreation: {
    isActive: false,
    selectNameActive: false,
    groupName: "",
    error: "",
    loading: false,
    members: []
  },
  messages: {},
  initialMsgLoadedFinished: [],
  selectedMessages: {},
  messagesInput: {},
  renderedMessagesList: {},
  rerenderUnreadMessagesStart: "",
  contacts: {},
  lastScrollPosition: {},
  messagePopup: "",
  optionsPopupContactList: "",
  optionsPopupChatWindow: "",
  messagesListRef: "",
  contactsStatus: {},
  chatMembersStatus: {},
  chatParticipants: {},
  confirmModal: {
    isActive: false,
    function: "",
    contactKey: ""
  },
  messageDeletionProcess: false,
  firebaseListeners: {
    contactUnreadMessages: {}
  },
  groupInfoSettingsActive: false
}

export default reducer
