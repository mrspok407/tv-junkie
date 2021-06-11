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

interface ContactRequestDataInterface {
  [key: string]: ContactInfoInterface | boolean
}

const contactsDatabaseRef = (uid: string) => `${uid}/contactsDatabase`

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
