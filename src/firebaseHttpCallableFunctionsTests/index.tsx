interface ContextInterface {
  auth: { uid: string | undefined }
}

interface DataInterface {
  contactUid: string
  status?: string
  timeStamp?: number
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
  const { contactUid, timeStamp } = data

  try {
    const authUserName = await database.ref(`users/${authUid}/username`).once("value")

    await Promise.all([database.ref(`users/${contactUid}/contactsDatabase/newContactsRequests/${authUid}`).set(true)])

    return database.ref(`users/${contactUid}/contactsDatabase/contactsList/${authUid}`).set({
      status: false,
      receiver: false,
      userName: authUserName.val(),
      pinned_lastActivityTS: `false_${timeStamp}`,
      timeStamp,
      recipientNotified: false,
      newActivity: true
    })
  } catch (error) {
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

      database
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
    console.log(error)
  }
}
