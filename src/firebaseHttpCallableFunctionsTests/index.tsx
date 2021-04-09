interface ContextInterface {
  auth: { uid: string | undefined }
}

interface DataInterface {
  contactUid: string
  status?: string
  timeStamp?: number
  resendRequest?: boolean
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
  const { contactUid, timeStamp, resendRequest = false } = data

  if (!context.auth) {
    throw new Error("The function must be called while authenticated.")
  }

  try {
    const authUserName = await database.ref(`users/${authUid}/username`).once("value")

    return database.ref(`users/${contactUid}/contactsDatabase`).update({
      [`newContactsRequests/${authUid}`]: true,
      newContactsActivity: true,
      [`contactsList/${authUid}`]: {
        status: false,
        receiver: false,
        userName: authUserName.val(),
        pinned_lastActivityTS: `false_${timeStamp}`,
        timeStamp,
        recipientNotified: false,
        newActivity: true
      }
    })
  } catch (error) {
    if (!resendRequest) {
      database.ref(`users/${authUid}/contactsDatabase/contactsList/${contactUid}`).set(null)
    }
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
  timeStamp: number
}) => {
  const authUserUid = context?.auth?.uid
  const { contactUid, status } = data

  // const timeStamp = admin.database.ServerValue.TIMESTAMP;
  try {
    const pinnedLastActivityTS = await database
      .ref(`users/${contactUid}/contactsDatabase/contactsList/${authUserUid}`)
      .child("pinned_lastActivityTS")
      .once("value")
    const isPinned = !!(pinnedLastActivityTS.val().slice(0, 4) === "true")

    await database.ref(`users/${contactUid}/contactsDatabase/contactsList/${authUserUid}`).update({
      status: status === "accept" ? true : "rejected",
      newActivity: true,
      timeStamp
    })

    const timeStampData = await database
      .ref(`users/${contactUid}/contactsDatabase/contactsList/${authUserUid}`)
      .child("timeStamp")
      .once("value")

    return database
      .ref(`users/${contactUid}/contactsDatabase/contactsList/${authUserUid}`)
      .update({ pinned_lastActivityTS: `${isPinned}_${timeStampData.val()}` })
  } catch (error) {
    if (status === "accept") {
      database.ref(`users/${authUserUid}/contactsDatabase/contactsList/${contactUid}`).update({ status: false })
      database
        .ref(`users/${contactUid}/contactsDatabase/contactsList/${authUserUid}`)
        .update({ status: false, newActivity: null })
    }
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
  const authUserUid = context?.auth?.uid
  const { contactUid } = data

  if (!context.auth) {
    throw new Error("The function must be called while authenticated.")
  }

  try {
    return database.ref(`users/${contactUid}/contactsDatabase/contactsList/${authUserUid}`).update({
      recipientNotified: true
    })
  } catch (error) {
    database.ref(`users/${authUserUid}/contactsDatabase/contactsList/${contactUid}/recipientNotified`).off()

    database.ref(`users/${authUserUid}/contactsDatabase`).update({
      [`contactsList/${contactUid}/recipientNotified`]: false,
      [`newContactsRequests/${contactUid}`]: true
    })
    throw new Error(`There has been some error updating database: ${error}`)
  }
}
