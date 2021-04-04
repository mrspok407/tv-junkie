"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newContactRequest = exports.contactsListHandler = exports.onMessageRemoved = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
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
exports.onMessageRemoved = functions.database
    .ref("users/{uid}/content/messages/{key}")
    .onDelete(async (change, context) => {
    console.log({ params: context.params });
    const messageKey = context.params.key;
    return database
        .ref(`users/drv5lG97VxVBLgkdn8bMhdxmqQT2/content/unreadMessages_uid1/${messageKey}`)
        .set(null);
});
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
//   });
exports.contactsListHandler = functions.database
    .ref("users/{userUid}/contactsDatabase/contactsList/{contactUid}")
    .onWrite(async (change, context) => {
    const userUid = context.params.userUid;
    const contactUid = context.params.contactUid;
    const beforeValue = change.before.val();
    const afterValue = change.after.val();
    const contactsDatabaseRef = database.ref(`users/${userUid}/contactsDatabase`);
    if (!change.before.exists() && !afterValue.receiver) {
        contactsDatabaseRef.child(`newContactsRequests/${contactUid}`).set(true);
        return contactsDatabaseRef.child("newContactsActivity").set(true);
    }
    if (afterValue.recipientNotified) {
        contactsDatabaseRef.child(`newContactsRequests/${contactUid}`).set(null);
        return database
            .ref(`users/${contactUid}/contactsDatabase/contactsList/${userUid}`)
            .update({ recipientNotified: true });
    }
    console.log({
        beforeValue,
        afterValue,
        userUid,
        contactUid,
        params: context.params
    });
});
exports.newContactRequest = functions.https.onCall(async (data, context) => {
    var _a;
    const authUid = (_a = context === null || context === void 0 ? void 0 : context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const { contactUid, timeStamp } = data;
    const authUserName = await database.ref(`users/${authUid}/userName`);
    return database
        .ref(`users/${contactUid}/contactsDatabase/contactsList/${authUid}`)
        .set({
        status: false,
        receiver: false,
        userName: authUserName,
        pinned_lastActivityTS: `false_${timeStamp}`,
        timeStamp,
        recipientNotified: false,
        newActivity: true
    });
});
//# sourceMappingURL=index.js.map