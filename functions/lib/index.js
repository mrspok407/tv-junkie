"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleContactRequest = exports.newContactRequest = exports.createNewGroup = exports.updateLastSeen = exports.decrementContacts = exports.incrementContacts = exports.removeNewContactsActivity = exports.addNewContactsActivity = exports.updatePinnedTimeStamp = void 0;
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
const contactsDatabaseRef = (uid) => `${uid}/contactsDatabase`;
exports.updatePinnedTimeStamp = functions.database
    .ref("users/{authUid}/contactsDatabase/contactsLastActivity/{contactUid}")
    .onWrite(async (change, context) => {
    const { authUid, contactUid } = context.params;
    const afterData = change.after;
    const beforeData = change.before;
    const contactRef = database.ref(`users/${contactsDatabaseRef(authUid)}/contactsList/${contactUid}`);
    const timeStamp = afterData.val();
    if (!afterData.exists())
        return;
    if (!beforeData.exists()) {
        return contactRef.update({
            pinned_lastActivityTS: `false_${timeStamp}`
        });
    }
    if (beforeData.val() !== afterData.val()) {
        const isPinnedData = await contactRef.child("pinned_lastActivityTS").once("value");
        const isPinned = !!((isPinnedData === null || isPinnedData === void 0 ? void 0 : isPinnedData.val().slice(0, 4)) === "true");
        console.log(`${isPinned}_${timeStamp}`);
        return contactRef.update({
            pinned_lastActivityTS: `${isPinned}_${timeStamp}`
        });
    }
});
exports.addNewContactsActivity = functions.database
    .ref("privateChats/{chatKey}/members/{memberKey}/unreadMessages")
    .onCreate((snapshot, context) => {
    const { chatKey, memberKey } = context.params;
    let otherMemberKey;
    if (memberKey === chatKey.slice(0, memberKey.length)) {
        otherMemberKey = chatKey.slice(memberKey.length + 1);
    }
    else {
        otherMemberKey = chatKey.slice(0, -memberKey.length - 1);
    }
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    const updateData = {
        [`${contactsDatabaseRef(memberKey)}/newContactsActivity/${otherMemberKey}`]: true,
        [`${contactsDatabaseRef(memberKey)}/contactsLastActivity/${otherMemberKey}`]: timeStamp
    };
    return database.ref("users").update(updateData);
});
exports.removeNewContactsActivity = functions.database
    .ref("privateChats/{chatKey}/members/{memberKey}/unreadMessages")
    .onDelete((snapshot, context) => {
    const { chatKey, memberKey } = context.params;
    let otherMemberKey;
    if (memberKey === chatKey.slice(0, memberKey.length)) {
        otherMemberKey = chatKey.slice(memberKey.length + 1);
    }
    else {
        otherMemberKey = chatKey.slice(0, -memberKey.length - 1);
    }
    return database.ref(`users/${memberKey}/contactsDatabase/newContactsActivity/${otherMemberKey}`).set(null);
});
exports.incrementContacts = functions.database
    .ref("users/{authUid}/contactsDatabase/contactsList/{contactUid}")
    .onCreate(async (snapshot) => {
    var _a, _b;
    const contactsNumberRef = (_b = (_a = snapshot.ref.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.child("contactsAmount");
    return contactsNumberRef === null || contactsNumberRef === void 0 ? void 0 : contactsNumberRef.transaction((currentValue) => {
        if (currentValue === null) {
            return 1;
        }
        else {
            return currentValue + 1;
        }
    });
});
exports.decrementContacts = functions.database
    .ref("users/{authUid}/contactsDatabase/contactsList/{contactUid}")
    .onDelete(async (snapshot) => {
    var _a, _b;
    const contactsNumberRef = (_b = (_a = snapshot.ref.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.child("contactsAmount");
    return contactsNumberRef === null || contactsNumberRef === void 0 ? void 0 : contactsNumberRef.transaction((currentValue) => {
        if (currentValue === null) {
            return 0;
        }
        else {
            return currentValue - 1;
        }
    });
});
exports.updateLastSeen = functions.database
    .ref("privateChats/{chatKey}/members/{memberKey}/status/isOnline")
    .onDelete(async (snapshot) => {
    var _a;
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    (_a = snapshot.ref.parent) === null || _a === void 0 ? void 0 : _a.update({ lastSeen: timeStamp });
});
exports.createNewGroup = functions.https.onCall(async (data, context) => {
    var _a;
    const authUid = (_a = context === null || context === void 0 ? void 0 : context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const { members, groupName } = data;
    if (!authUid) {
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    const membersUpdateData = {};
    const groupChatRef = database.ref("groupChats").push();
    const newMessageRef = database.ref(`groupChats/${groupChatRef.key}/messages`).push();
    members.forEach((member) => {
        membersUpdateData[`groupChats/${groupChatRef.key}/members/${member.key}/status`] = {
            isOnline: false,
            role: "USER"
        };
        membersUpdateData[`users/${member.key}/contactsDatabase/contactsList/${groupChatRef.key}`] = {
            pinned_lastActivityTS: "false",
            isGroupChat: true,
            groupName: groupName || "Nameless group wow",
            role: "USER"
        };
        membersUpdateData[`users/${member.key}/contactsDatabase/contactsLastActivity/${groupChatRef.key}`] = timeStamp;
        membersUpdateData[`users/${member.key}/contactsDatabase/newContactsActivity/${groupChatRef.key}`] = true;
    });
    try {
        const updateData = Object.assign(Object.assign({}, membersUpdateData), { [`groupChats/${groupChatRef.key}/members/${authUid}/status`]: {
                isOnline: false,
                role: "ADMIN"
            }, [`users/${authUid}/contactsDatabase/contactsList/${groupChatRef.key}`]: {
                pinned_lastActivityTS: "false",
                isGroupChat: true,
                role: "ADMIN"
            }, [`users/${authUid}/contactsDatabase/contactsLastActivity/${groupChatRef.key}`]: timeStamp, [`groupChats/${groupChatRef.key}/messages/${newMessageRef.key}`]: {
                members,
                isNewMembers: true,
                timeStamp
            } });
        return database.ref().update(updateData);
    }
    catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
});
exports.newContactRequest = functions.https.onCall(async (data, context) => {
    var _a;
    const authUid = (_a = context === null || context === void 0 ? void 0 : context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const { contactUid, contactName, resendRequest = false } = data;
    if (!authUid) {
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    const contactInfoData = !resendRequest
        ? {
            [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}`]: {
                status: false,
                receiver: true,
                userName: contactName,
                userNameLowerCase: contactName.toLowerCase(),
                pinned_lastActivityTS: "false"
            }
        }
        : {
            [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}/status`]: false,
            [`${contactsDatabaseRef(authUid)}/contactsLastActivity/${contactUid}`]: timeStamp
        };
    try {
        const authUserName = await database.ref(`users/${authUid}/userName`).once("value");
        const updateData = Object.assign(Object.assign({}, contactInfoData), { [`${contactsDatabaseRef(contactUid)}/newContactsRequests/${authUid}`]: true, [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}`]: {
                status: false,
                receiver: false,
                userName: authUserName.val(),
                userNameLowerCase: authUserName.val().toLowerCase(),
                pinned_lastActivityTS: "false"
            } });
        return database.ref("users").update(updateData);
    }
    catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
});
exports.handleContactRequest = functions.https.onCall(async (data, context) => {
    var _a;
    const authUid = (_a = context === null || context === void 0 ? void 0 : context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const { contactUid, status } = data;
    if (!authUid) {
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    const authPathToUpdate = status === "accept" ? `${contactUid}/status` : contactUid;
    try {
        const updateData = {
            [`${contactsDatabaseRef(authUid)}/contactsList/${authPathToUpdate}`]: status === "accept" ? true : null,
            [`${contactsDatabaseRef(authUid)}/newContactsRequests/${contactUid}`]: null,
            [`${contactsDatabaseRef(authUid)}/contactsLastActivity/${contactUid}`]: timeStamp,
            [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}/status`]: status === "accept" ? true : "rejected",
            [`${contactsDatabaseRef(contactUid)}/newContactsActivity/${authUid}`]: true,
            [`${contactsDatabaseRef(contactUid)}/contactsLastActivity/${authUid}`]: timeStamp
        };
        return database.ref("users").update(updateData);
    }
    catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
});
//# sourceMappingURL=index.js.map