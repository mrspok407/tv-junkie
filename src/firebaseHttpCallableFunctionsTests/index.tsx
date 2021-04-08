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

  const newContactRequestRef = database.ref(`users/${contactUid}/contactsDatabase/newContactsRequests/${authUid}`)

  const newContactsActivityRef = database.ref(`users/${contactUid}/contactsDatabase/newContactsActivity`)

  try {
    const authUserName = await database.ref(`users/${authUid}/username`).once("value")

    return Promise.all([
      newContactRequestRef.set(true),
      newContactsActivityRef.set(true),
      database.ref(`users/${contactUid}/contactsDatabase/contactsList/${authUid}`).set({
        status: false,
        receiver: false,
        userName: authUserName.val(),
        pinned_lastActivityTS: `false_${timeStamp}`,
        timeStamp,
        recipientNotified: false,
        newActivity: true
      })
    ])
  } catch (error) {
    newContactRequestRef.set(null)
    newContactsActivityRef.set(null)
    database.ref(`users/${contactUid}/contactsDatabase/contactsList/${authUid}`).set(null)
    if (!resendRequest) {
      database.ref(`users/${authUid}/contactsDatabase/contactsList/${contactUid}`).set(null)
    }
    throw new Error(`There has been some error handling contact request: ${error}`)
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
  let isPinned = false

  try {
    const pinnedLastActivityTS = await database
      .ref(`users/${contactUid}/contactsDatabase/contactsList/${authUserUid}`)
      .child("pinned_lastActivityTS")
      .once("value")

    isPinned = !!(pinnedLastActivityTS.val().slice(0, 4) === "true")
  } catch (error) {
    console.log(error)
  }

  return database.ref(`users/${contactUid}/contactsDatabase/contactsList/${authUserUid}`).update(
    {
      status: status === "accept" ? true : "rejected",
      newActivity: true,
      timeStamp
    },
    async () => {
      const timeStamp = await database
        .ref(`users/${contactUid}/contactsDatabase/contactsList/${authUserUid}`)
        .child("timeStamp")
        .once("value")

      return database
        .ref(`users/${contactUid}/contactsDatabase/contactsList/${authUserUid}`)
        .update({ pinned_lastActivityTS: `${isPinned}_${timeStamp.val()}` })
    }
  )
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

  try {
    return database.ref(`users/${contactUid}/contactsDatabase/contactsList/${authUserUid}`).update({
      recipientNotified: true
    })
  } catch (error) {
    database.ref(`users/${authUserUid}/contactsDatabase/contactsList/${contactUid}`).update({
      recipientNotified: false
    })
    database.ref(`users/${authUserUid}/contactsDatabase/newContactsRequests/${contactUid}`).set(true)
    throw new Error(`There has been some error handling contact request: ${error}`)
  }
}
