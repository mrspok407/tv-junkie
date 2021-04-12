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
  timeStamp: unknown
  recipientNotified?: boolean
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
          timeStamp,
          pinned_lastActivityTS: "false",
          recipientNotified: false
        }
      }
    : {
        [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}/status`]: false,
        [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}/timeStamp`]: timeStamp,
        [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}/recipientNotified`]: false
      }

  try {
    const authUserName = await database.ref(`users/${authUid}/username`).once("value")

    const updateData: ContactRequestDataInterface = {
      ...contactInfoData,
      [`${contactsDatabaseRef(contactUid)}/newContactsRequests/${authUid}`]: true,
      // [`${contactsDatabaseRef(contactUid)}/newContactsActivity/${authUid}`]: true,
      [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}`]: {
        status: false,
        receiver: false,
        userName: authUserName.val(),
        timeStamp,
        pinned_lastActivityTS: "false",
        recipientNotified: false,
        newActivity: true
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
      // [`${contactsDatabaseRef(authUid)}/newContactsActivity/${contactUid}`]: null,
      [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}/status`]: status === "accept" ? true : "rejected",
      [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}/newActivity`]: true,
      [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}/timeStamp`]: timeStamp
    }

    return database.ref("users").update(updateData)
  } catch (error) {
    throw new Error(`There has been some error updating database: ${error}`)
  }
}

export const _updateRecipientNotified = async ({
  data,
  context,
  database
}: {
  data: DataInterface
  context: ContextInterface
  database: any
}) => {
  const authUid = context?.auth?.uid
  const { contactUid } = data

  if (!authUid) {
    throw new Error("The function must be called while authenticated.")
  }

  const updateData = {
    [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}/recipientNotified`]: true,
    // [`${contactsDatabaseRef(authUid)}/newContactsRequests/${contactUid}`]: null,
    [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}/recipientNotified`]: true
  }

  try {
    return database.ref("users").update(updateData)
  } catch (error) {
    throw new Error(`There has been some error updating database: ${error}`)
  }
}
