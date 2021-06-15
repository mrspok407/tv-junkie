import { GroupCreationNewMemberInterface } from "Components/Pages/Contacts/@Types"

interface ContextInterface {
  auth: { uid: string | undefined }
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

export const _createNewGroup = async ({
  data,
  context,
  database
}: {
  data: { members: GroupCreationNewMemberInterface[]; groupName: string; timeStamp?: number }
  context: ContextInterface
  database: any
}) => {
  const authUid = context?.auth?.uid
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
        members,
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
  const authUid = context?.auth?.uid
  const { contactUid, contactName, timeStamp, resendRequest = false } = data

  if (!authUid) {
    throw new Error("The function must be called while authenticated.")
  }

  const contactInfoData: any = !resendRequest
    ? {
        [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}`]: {
          status: false,
          receiver: true,
          userName: contactName,
          userNameLowerCase: contactName?.toLowerCase(),
          pinned_lastActivityTS: "false"
        },
        [`${contactsDatabaseRef(authUid)}/contactsLastActivity/${contactUid}`]: timeStamp
      }
    : {
        [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}/status`]: false,
        [`${contactsDatabaseRef(authUid)}/contactsLastActivity/${contactUid}`]: timeStamp
      }

  try {
    const authUserName = await database.ref(`users/${authUid}/username`).once("value")

    const updateData: ContactRequestDataInterface = {
      ...contactInfoData,
      [`${contactsDatabaseRef(contactUid)}/newContactsRequests/${authUid}`]: true,
      [`${contactsDatabaseRef(contactUid)}/contactsLastActivity/${authUid}`]: timeStamp,
      [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}`]: {
        status: false,
        receiver: false,
        userName: authUserName.val(),
        userNameLoserCase: authUserName.val().toLowerCase(),
        pinned_lastActivityTS: "false"
      }
    }

    return database.ref("users").update(updateData)
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
  const authUid = context?.auth?.uid
  const { contactUid, status } = data

  if (!authUid) {
    throw new Error("The function must be called while authenticated.")
  }

  const authPathToUpdate = status === "accept" ? `${contactUid}/status` : contactUid

  try {
    const updateData = {
      [`${contactsDatabaseRef(authUid)}/contactsList/${authPathToUpdate}`]: status === "accept" ? true : null,
      [`${contactsDatabaseRef(authUid)}/newContactsRequests/${contactUid}`]: null,
      [`${contactsDatabaseRef(authUid)}/contactsLastActivity/${contactUid}`]: timeStamp,
      [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}/status`]: status === "accept" ? true : "rejected",
      [`${contactsDatabaseRef(contactUid)}/newContactsActivity/${authUid}`]: true,
      [`${contactsDatabaseRef(contactUid)}/contactsLastActivity/${authUid}`]: timeStamp
    }

    return database.ref("users").update(updateData)
  } catch (error) {
    throw new Error(`There has been some error updating database: ${error}`)
  }
}
