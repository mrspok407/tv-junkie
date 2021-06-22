export interface ContactInfoInterface {
  status: boolean | string
  receiver: boolean
  userName: string
  groupName: string
  timeStamp: number
  pinned_lastActivityTS: string
  key: string
  chatKey: string
  newContactsActivity: boolean | null
  lastContactActivity: number | null
  newContactsRequests: boolean | null
  isOnline: boolean | null
  lastSeen: number | null
  lastMessage: MessageInterface
  unreadMessages: string[]
  unreadMessagesContact: string[]
  isGroupChat: boolean
  role: string
  removedFromGroup: boolean
  lastAvailableMessageTS: number
}

export const CONTACT_INFO_INITIAL_DATA = {
  status: [false, ""],
  receiver: false,
  userName: "",
  pinned_lastActivityTS: ""
}

export interface ContactsInterface {
  [key: string]: ContactInfoInterface
}

export interface MessageInterface {
  message: string
  sender: string
  username?: string
  timeStamp: number
  key: string
  isDelivered?: boolean
  isEdited?: boolean
  isNewMembers?: boolean
  isRemovedMember?: boolean
  removedMember?: {
    key: string
    username: string
  }
  members?: { username: string }[]
}

export interface ContactStatusInterface {
  isOnline: boolean
  lastSeen: number | undefined
  chatBottom: boolean | undefined
  pageInFocus: boolean | undefined
  isTyping: boolean | null
}

export interface MembersStatusGroupChatInterface {
  isOnline: boolean
  lastSeen: number | undefined
  chatBottom: boolean | undefined
  pageInFocus: boolean | undefined
  isTyping: boolean | null
  key: string
  username: string
  usernameLowerCase: string
  role: string
}

export const MESSAGE_INITIAL_DATA = {
  message: "",
  sender: "",
  timeStamp: 0
}

export interface MessageInputInterface {
  message: string
  anchorOffset?: number
  scrollTop?: number
  editingMsgKey?: string | null
}

export interface ActiveChatInterface {
  chatKey: string
  contactKey: string
}

export interface GroupCreationNewMemberInterface {
  key: string
  username?: string
  lastSeen?: number | string | null
  isOnline?: boolean | null
  chatKey?: string
}
export interface GroupCreationInterface {
  isActive: boolean
  selectNameActive: boolean
  groupName: string
  error: string
  loading: boolean
  members: GroupCreationNewMemberInterface[]
}

export interface ContactsStateInterface {
  contactsUnreadMessages: {
    [key: string]: string[]
  }
  authUserUnreadMessages: {
    [key: string]: string[]
  }
  activeChat: ActiveChatInterface
  groupCreation: GroupCreationInterface
  messages: {
    [key: string]: MessageInterface[]
  }
  initialMsgLoadedFinished: string[]
  selectedMessages: {
    [key: string]: string[]
  }
  messagesInput: {
    [key: string]: MessageInputInterface
  }
  renderedMessagesList: {
    [key: string]: MessageInterface[]
  }
  contacts: {
    [key: string]: ContactInfoInterface
  }
  lastScrollPosition: {
    [key: string]: number | undefined
  }
  contactsStatus: {
    [key: string]: ContactStatusInterface
  }
  chatMembersStatus: {
    [key: string]: MembersStatusGroupChatInterface[]
  }
  messagesListRef: any
  messagePopup: string
  optionsPopupContactList: string
  optionsPopupChatWindow: string
  messageDeletionProcess: boolean
  confirmModal: {
    isActive: boolean
    function: string
    contactKey?: string
  }
  firebaseListeners: {
    contactUnreadMessages: boolean
  }
  groupInfoSettingsActive: boolean
}

export interface SnapshotStringBooleanInterface {
  val: () => { [key: string]: boolean | null } | null
  numChildren: () => number
}

export interface ContainerRectInterface {
  height: number
  scrollHeight: number
  scrollTop: number
  thresholdTopLoad: number
  thresholdTopRender: number
  thresholdBottomRender: number
}

export interface ConfirmFunctionsInterface {
  [key: string]: ({ contactInfo }: { contactInfo: ContactInfoInterface }) => any
}
