import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Cloud Functions interesting points:
//
// It should always return a promise. So the function will know when it's finished (resolved or rejected).
//
// Beware of infinite loops in .onUpdate and .onWrite. If you updating something in the same ref as .onUpdate, it will
// cause infinite loop. So you have to put if statement to check if data was changed.
//
// In Cloud Functions I can access anywhere, database rules don't apply. So it will skip validation configured in rules.
// Be sure that you send the data in a format you intended.
//
// Cold start time. Import at the top will be in every instance of functions on the server,
// even if particular function doesn't need them
// If you need heavy library import * megaMath from "heavy-duty-math-library"
// you should fetch in inside of the needed function: const megaMath = await import("heavy-duty-math-library")
// More info https://youtu.be/v3eG9xpzNXM?list=PLl-K7zZEsYLm9A9rcHb1IkyQUu6QwbjdM
//
// context.eventId is a unique identifier for every function call
// You can invoke cloud functions on client (by click or something) with callableFunction. See functions at the bottom
// More info: https://firebase.google.com/docs/functions/callable#web https://youtu.be/8mL1VuiL5Kk?t=593

admin.initializeApp();

const database = admin.database();

interface ContactInfoInterface {
  [key: string]: string | boolean | number | unknown;
  status: boolean;
  receiver?: boolean;
  userName?: string;
  timeStamp: unknown;
  // recipientNotified?: boolean;
}

interface ContactRequestDataInterface {
  [key: string]: ContactInfoInterface | boolean;
}

// const authUserInContactsRef = ({contactUid, authUid}: {contactUid: string; authUid: string | undefined}) =>
//   database.ref(`users/${contactUid}/contactsDatabase/contactsList/${authUid}`);

// const contactInAuthUserRef = ({
//   contactUid,
//   authUid: authUid
// }: {
//   contactUid: string;
//   authUid: string | undefined;
// }) =>
//   database.ref(`users/${authUid}/contactsDatabase/contactsList/${contactUid}`);

const contactsDatabaseRef = (uid: string) => `${uid}/contactsDatabase`;

// interface ContactInfo {
//   status: boolean;
//   receiver: boolean;
//   userName: string;
//   // eslint-disable-next-line camelcase
//   pinned_lastActivityTS: string;
//   timeStamp: number;
//   recipientNotified: boolean;
//   newActivity: boolean;
// }

export const updatePinnedTimeStamp = functions.database
  .ref("users/{authUid}/contactsDatabase/contactsList/{contactUid}/timeStamp")
  .onWrite(async (change) => {
    const afterData = change.after;
    const beforeData = change.before;

    const timeStamp = afterData.val();

    if (!afterData.exists()) return;

    if (!beforeData.exists()) {
      return afterData.ref.parent?.update({
        pinned_lastActivityTS: `true_${timeStamp}`
      });
    }

    if (beforeData.val() !== afterData.val()) {
      const isPinnedData = await afterData.ref.parent?.child("pinned_lastActivityTS").once("value");
      const isPinned = !!(isPinnedData?.val().slice(0, 4) === "true");

      return afterData.ref.parent?.update({
        pinned_lastActivityTS: `${isPinned}_${timeStamp}`
      });
    }
  });

export const addNewContactsActivity = functions.database
  .ref("privateChats/{chatKey}/members/{memberKey}/unreadMessages")
  .onCreate((snapshot, context) => {
    const {chatKey, memberKey} = context.params;
    let otherMemberKey;

    if (memberKey === chatKey.slice(0, memberKey.length)) {
      otherMemberKey = chatKey.slice(memberKey.length + 1);
    } else {
      otherMemberKey = chatKey.slice(0, -memberKey.length - 1);
    }

    return database.ref(`users/${memberKey}/contactsDatabase/newContactsActivity/${otherMemberKey}`).set(true);
  });

export const removeNewContactsActivity = functions.database
  .ref("privateChats/{chatKey}/members/{memberKey}/unreadMessages")
  .onDelete((snapshot, context) => {
    const {chatKey, memberKey} = context.params;
    let otherMemberKey;

    if (memberKey === chatKey.slice(0, memberKey.length)) {
      otherMemberKey = chatKey.slice(memberKey.length + 1);
    } else {
      otherMemberKey = chatKey.slice(0, -memberKey.length - 1);
    }

    return database.ref(`users/${memberKey}/contactsDatabase/newContactsActivity/${otherMemberKey}`).set(null);
  });

export const incrementContacts = functions.database
  .ref("users/{authUid}/contactsDatabase/contactsList/{contactUid}")
  .onCreate(async (snapshot) => {
    const contactsNumberRef = snapshot.ref.parent?.parent?.child("contactsAmount");

    return contactsNumberRef?.transaction((currentValue) => {
      if (currentValue === null) {
        return 1;
      } else {
        return currentValue + 1;
      }
    });
  });

export const decrementContacts = functions.database
  .ref("users/{authUid}/contactsDatabase/contactsList/{contactUid}")
  .onDelete(async (snapshot) => {
    const contactsNumberRef = snapshot.ref.parent?.parent?.child("contactsAmount");

    return contactsNumberRef?.transaction((currentValue) => {
      if (currentValue === null) {
        return 0;
      } else {
        return currentValue - 1;
      }
    });
  });

export const updateLastSeen = functions.database
  .ref("privateChats/{chatKey}/members/{memberKey}/status/isOnline")
  .onDelete(async (snapshot) => {
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    snapshot.ref.parent?.update({lastSeen: timeStamp});
  });

export const newContactRequest = functions.https.onCall(async (data, context) => {
  const authUid = context?.auth?.uid;
  const {contactUid, contactName, resendRequest = false} = data;

  if (!authUid) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
  }

  const timeStamp = admin.database.ServerValue.TIMESTAMP;

  const contactInfoData: any = !resendRequest
    ? {
        [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}`]: {
          status: false,
          receiver: true,
          userName: contactName,
          timeStamp,
          pinned_lastActivityTS: "false"
          // recipientNotified: false
        }
      }
    : {
        [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}/status`]: false,
        [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}/timeStamp`]: timeStamp
        // [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}/recipientNotified`]: false
      };

  try {
    const authUserName = await database.ref(`users/${authUid}/userName`).once("value");

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
        // recipientNotified: false,
        newActivity: true
      }
    };

    return database.ref("users").update(updateData);
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});

export const handleContactRequest = functions.https.onCall(async (data, context) => {
  const authUid = context?.auth?.uid;
  const {contactUid, status} = data;

  if (!authUid) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
  }

  const timeStamp = admin.database.ServerValue.TIMESTAMP;
  const authPathToUpdate = status === "accept" ? `${contactUid}/status` : contactUid;

  try {
    const updateData = {
      [`${contactsDatabaseRef(authUid)}/contactsList/${authPathToUpdate}`]: status === "accept" ? true : null,
      [`${contactsDatabaseRef(authUid)}/newContactsRequests/${contactUid}`]: null,
      // [`${contactsDatabaseRef(authUid)}/newContactsActivity/${contactUid}`]: null,
      [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}/status`]: status === "accept" ? true : "rejected",
      [`${contactsDatabaseRef(contactUid)}/newContactsActivity/${authUid}`]: true,
      // [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}/newActivity`]: true,
      [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}/timeStamp`]: timeStamp
    };

    return database.ref("users").update(updateData);
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});

// export const updateRecipientNotified = functions.https.onCall(async (data, context) => {
//   const authUid = context?.auth?.uid;
//   const {contactUid} = data;

//   if (!authUid) {
//     throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
//   }

//   const updateData = {
//     [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}/recipientNotified`]: true,
//     // [`${contactsDatabaseRef(authUid)}/newContactsRequests/${contactUid}`]: null,
//     [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}/recipientNotified`]: true
//   };

//   try {
//     return database.ref("users").update(updateData);
//   } catch (error) {
//     throw new functions.https.HttpsError("unknown", error.message, error);
//   }
// });

// export const contactsListHandler = functions.database
//   .ref("users/{userUid}/contactsDatabase/contactsList/{contactUid}")
//   .onWrite(async (change, context) => {
//     const authUserUid = context.params.userUid;
//     const contactUid = context.params.contactUid;

//     // const beforeValue: ContactInfo = change.before.val();
//     // const afterValue: ContactInfo = change.after.val();

//     console.log({
//       // beforeValue,
//       // afterValue,
//       userUid: authUserUid,
//       contactUid,
//       params: context.params
//     });

//     // const contactsDatabaseRef = database.ref(
//     //   `users/${authUserUid}/contactsDatabase`
//     // );

//     // if (!change.before.exists() && !afterValue.receiver) {
//     //   await contactsDatabaseRef
//     //     .child(`newContactsRequests/${contactUid}`)
//     //     .set(true);
//     //   return contactsDatabaseRef.child("newContactsActivity").set(true);
//     // }

//     // if (beforeValue.recipientNotified !== afterValue.recipientNotified) {
//     //   if (!afterValue.receiver) {
//     //     await contactsDatabaseRef
//     //       .child(`newContactsRequests/${contactUid}`)
//     //       .set(null);
//     //     await contactInAuthUserDatabaseRef({authUserUid, contactUid}).update({
//     //       newActivity: null
//     //     });
//     //   }
//     //   return database
//     //     .ref(`users/${contactUid}/contactsDatabase/contactsList/${authUserUid}`)
//     //     .update({
//     //       recipientNotified: afterValue.recipientNotified,
//     //       newActivity: null
//     //     });
//     // }

//     // if (beforeValue.status !== afterValue.status) {
//     //   console.log({beforeValue, afterValue});
//     //   const timeStamp = admin.database.ServerValue.TIMESTAMP;
//     //   let isPinned: boolean;

//     //   try {
//     //     const pinnedLastActivityTS = await authUserInContactDatabaseRef({
//     //       contactUid,
//     //       authUserUid
//     //     })
//     //       .child("pinned_lastActivityTS")
//     //       .once("value");
//     //     isPinned = !!(pinnedLastActivityTS.val().slice(0, 4) === "true");
//     //   } catch (error) {
//     //     console.log(error);
//     //   }

//     //   return authUserInContactDatabaseRef({contactUid, authUserUid}).update(
//     //     {
//     //       status: afterValue.status,
//     //       newActivity: true,
//     //       timeStamp
//     //     },
//     //     async () => {
//     //       const timeStamp = await authUserInContactDatabaseRef({
//     //         contactUid,
//     //         authUserUid
//     //       })
//     //         .child("timeStamp")
//     //         .once("value");
//     //       return authUserInContactDatabaseRef({contactUid, authUserUid}).update(
//     //         {
//     //           pinned_lastActivityTS: `${isPinned}_${timeStamp.val()}`
//     //         }
//     //       );
//     //     }
//     //   );
//     // }
//   });

// export const onPageInFocus = functions.database.ref("users/{uid}/content/pageInFocus").onUpdate(async (change) => {
//   const after = change.after.val()
//   if ()
//   return
// })

// export const onShowUpdate = functions.database
//   .ref("users/{uid}/content/messages/status/online")
//   .onUpdate(async (change, context) => {
//     const uid = context.params.uid;
//     // const showId = context.params.showId;
//     // console.log({uid, showId});
//     const before = change.before.val();
//     const after = change.after.val();

//     console.log({before});
//     console.log({after});

//     if (!after) {
//       return database
//         .ref(`users/${uid}/content/messages/status/timeStamp`)
//         .set(admin.database.ServerValue.TIMESTAMP);
//     } else {
//       return;
//     }
//     // try {
//     //   await database
//     //     .ref(`users/${uid}/content/shows`)
//     //     .orderByKey()
//     //     .equalTo("82856")
//     //     .once("value", (snapshot) => {
//     //       console.log(snapshot.val());
//     //     });
//     // } catch (err) {
//     //   console.log(err);
//     // }

//     // if (before.database === after.database) return null;

//     // return change.after.ref.update({
//     //   previousDatabase: before.database,
//     //   time: admin.database.ServerValue.TIMESTAMP
//     // });
//   })
