import { GroupCreationNewMemberInterface, MembersStatusGroupChatInterface } from "Components/Pages/Contacts/@Types"
import { AuthUserInterface } from "Utils/Interfaces/UserAuth"

interface ContextInterface {
  authUser: AuthUserInterface
}

interface DataInterface {
  contactUid: string
  contactName?: string
  status?: string
  timeStamp?: number
  resendRequest?: boolean
}

interface ContactInfoInterface {
  [key: string]: string | boolean | number | unknown
  status: boolean
  receiver?: boolean
  userName?: string
  userNameLowerCase?: string
  timeStamp: unknown
}

interface GroupChatInfoInterface {
  [key: string]: string | boolean
}

interface GroupChatMemberStatusInterface {
  [key: string]: string | boolean
}

interface ContactRequestDataInterface {
  [key: string]: ContactInfoInterface | boolean
}

const contactsDatabaseRef = (uid: string) => `${uid}/contactsDatabase`

export const _removeMemberFromGroup = async ({
  data,
  context,
  database
}: {
  data: {
    member: any
    groupChatKey: string
    timeStampData: number
  }
  context: ContextInterface
  database: any
}) => {
  const authUid = context?.authUser?.uid
  const { member, groupChatKey, timeStampData } = data

  if (!authUid) {
    throw new Error("The function must be called while authenticated.")
  }

  const newMessageRef = database.ref(`groupChats/${groupChatKey}/messages`).push()
  try {
    const updateData = {
      [`groupChats/${groupChatKey}/messages/${newMessageRef.key}`]: {
        removedMember: {
          key: member.key,
          username: member.username
        },
        isRemovedMember: true,
        timeStamp: timeStampData
      },
      [`groupChats/${groupChatKey}/members/status/${member.key}`]: null,
      [`groupChats/${groupChatKey}/members/unreadMessages/${member.key}`]: null,
      [`users/${member.key}/contactsDatabase/contactsList/${groupChatKey}/removedFromGroup`]: true,
      [`users/${member.key}/contactsDatabase/newContactsActivity/${groupChatKey}`]: true,
      [`users/${member.key}/contactsDatabase/contactsLastActivity/${groupChatKey}`]: timeStampData
    }
    return database.ref().update(updateData)
  } catch (error) {
    throw new Error(`There has been some error updating database: ${error}`)
  }
}

export const _addNewGroupMembers = async ({
  data,
  context,
  database
}: {
  data: {
    members: GroupCreationNewMemberInterface[]
    groupInfo: { groupName: string; key: string }
    timeStamp?: number
  }
  context: ContextInterface
  database: any
}) => {
  const authUid = context?.authUser?.uid
  const { members, groupInfo, timeStamp } = data

  if (!authUid) {
    throw new Error("The function must be called while authenticated.")
  }
  const membersUpdateData: any = {}
  const newMessageRef = database.ref(`groupChats/${groupInfo.key}/messages`).push()

  members.forEach((member) => {
    membersUpdateData[`groupChats/${groupInfo.key}/members/status/${member.key}`] = {
      isOnline: false,
      username: member.username,
      usernameLowerCase: member.username?.toLowerCase(),
      role: "USER"
    }
    membersUpdateData[`users/${member.key}/contactsDatabase/contactsList/${groupInfo.key}`] = {
      pinned_lastActivityTS: "false",
      isGroupChat: true,
      groupName: groupInfo.groupName,
      role: "USER",
      removedFromGroup: false
    }
    membersUpdateData[`users/${member.key}/contactsDatabase/contactsLastActivity/${groupInfo.key}`] = timeStamp
    membersUpdateData[`users/${member.key}/contactsDatabase/newContactsActivity/${groupInfo.key}`] = true
  })

  try {
    const updateData: { [key: string]: GroupChatInfoInterface | GroupChatMemberStatusInterface } = {
      ...membersUpdateData,
      [`groupChats/${groupInfo.key}/messages/${newMessageRef.key}`]: {
        newMembers: members,
        isNewMembers: true,
        timeStamp
      }
    }

    return database.ref().update(updateData)
  } catch (error) {
    throw new Error(`There has been some error updating database: ${error}`)
  }
}

export const _createNewGroup = async ({
  data,
  context,
  database
}: {
  data: { members: GroupCreationNewMemberInterface[]; groupName: string; timeStamp?: number }
  context: ContextInterface
  database: any
}) => {
  const authUid = context?.authUser?.uid
  const { members, groupName, timeStamp } = data

  if (!authUid) {
    throw new Error("The function must be called while authenticated.")
  }
  const membersUpdateData: any = {}
  const groupChatRef = database.ref("groupChats").push()
  const newMessageRef = database.ref(`groupChats/${groupChatRef.key}/messages`).push()

  members.forEach((member) => {
    membersUpdateData[`groupChats/${groupChatRef.key}/members/status/${member.key}`] = {
      isOnline: false,
      username: member.username,
      usernameLowerCase: member.username?.toLowerCase(),
      role: "USER"
    }
    membersUpdateData[`users/${member.key}/contactsDatabase/contactsList/${groupChatRef.key}`] = {
      pinned_lastActivityTS: "false",
      isGroupChat: true,
      groupName: groupName || "Nameless group wow",
      role: "USER"
    }
    membersUpdateData[`users/${member.key}/contactsDatabase/contactsLastActivity/${groupChatRef.key}`] = timeStamp
    membersUpdateData[`users/${member.key}/contactsDatabase/newContactsActivity/${groupChatRef.key}`] = true
  })

  try {
    const updateData: { [key: string]: GroupChatInfoInterface | GroupChatMemberStatusInterface } = {
      ...membersUpdateData,
      [`groupChats/${groupChatRef.key}/members/status/${authUid}`]: {
        isOnline: false,
        username: context?.authUser?.username,
        usernameLowerCase: context?.authUser?.username?.toLowerCase(),
        role: "ADMIN"
      },
      [`users/${authUid}/contactsDatabase/contactsList/${groupChatRef.key}`]: {
        pinned_lastActivityTS: "false",
        isGroupChat: true,
        groupName: groupName || "Nameless group wow",
        role: "ADMIN"
      },
      [`users/${authUid}/contactsDatabase/contactsLastActivity/${groupChatRef.key}`]: timeStamp,
      [`groupChats/${groupChatRef.key}/messages/${newMessageRef.key}`]: {
        newMembers: members,
        isNewMembers: true,
        timeStamp
      },
      [`groupChats/${groupChatRef.key}/info`]: {
        groupName: groupName || "Nameless group wow"
      }
    }

    return database
      .ref()
      .update(updateData)
      .then(() => {
        console.log({ newGroupChatKey: groupChatRef.key })
        return { newGroupChatKey: groupChatRef.key }
      })
  } catch (error) {
    throw new Error(`There has been some error updating database: ${error}`)
  }
}

export const _newContactRequest = async ({
  data,
  context,
  database
}: {
  data: DataInterface
  context: ContextInterface
  database: any
}) => {
  const authUid = context?.authUser?.uid
  const { contactUid, contactName, timeStamp } = data

  if (!authUid) {
    throw new Error("The function must be called while authenticated.")
  }

  try {
    const updateData: any = {
      [`users/${contactsDatabaseRef(authUid)}/contactsList/${contactUid}`]: {
        status: false,
        receiver: true,
        userName: contactName,
        userNameLowerCase: contactName?.toLowerCase(),
        pinned_lastActivityTS: "false"
      },
      [`users/${contactsDatabaseRef(authUid)}/contactsLastActivity/${contactUid}`]: timeStamp,
      [`users/${contactsDatabaseRef(contactUid)}/newContactsRequests/${authUid}`]: true,
      [`users/${contactsDatabaseRef(contactUid)}/contactsLastActivity/${authUid}`]: timeStamp,
      [`users/${contactsDatabaseRef(contactUid)}/contactsList/${authUid}`]: {
        status: false,
        receiver: false,
        userName: context?.authUser?.username,
        userNameLowerCase: context?.authUser?.username?.toLowerCase(),
        pinned_lastActivityTS: "false"
      }
    }

    return database.ref().update(updateData)
  } catch (error) {
    throw new Error(`There has been some error updating database: ${error}`)
  }
}

export const _handleContactRequest = async ({
  data,
  context,
  database,
  timeStamp
}: {
  data: DataInterface
  context: ContextInterface
  database: any
  timeStamp?: any
}) => {
  const authUid = context?.authUser?.uid
  const { contactUid, status } = data

  if (!authUid) {
    throw new Error("The function must be called while authenticated.")
  }

  const chatKey = contactUid < authUid ? `${contactUid}_${authUid}` : `${authUid}_${contactUid}`
  const newMessageRef = database.ref(`privateChats/${chatKey}/messages`).push()

  const authPathToUpdate = status === "accept" ? `${contactUid}/status` : contactUid

  try {
    const updateData = {
      [`users/${contactsDatabaseRef(authUid)}/contactsList/${authPathToUpdate}`]: status === "accept" ? true : null,
      [`users/${contactsDatabaseRef(authUid)}/newContactsRequests/${contactUid}`]: null,
      [`users/${contactsDatabaseRef(authUid)}/contactsLastActivity/${contactUid}`]:
        status === "accept" ? timeStamp : null,
      [`users/${contactsDatabaseRef(contactUid)}/contactsList/${authUid}/status`]:
        status === "accept" ? true : "rejected",
      [`users/${contactsDatabaseRef(contactUid)}/newContactsActivity/${authUid}`]: true,
      [`users/${contactsDatabaseRef(contactUid)}/contactsLastActivity/${authUid}`]: timeStamp,
      [`privateChats/${chatKey}/messages/${newMessageRef.key}`]:
        status === "accept"
          ? {
              isNowContacts: true,
              timeStamp
            }
          : null
    }

    return database.ref().update(updateData)
  } catch (error) {
    throw new Error(`There has been some error updating database: ${error}`)
  }
}
