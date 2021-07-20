"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleContactRequest = exports.newContactRequest = exports.createNewGroup = exports.removeMemberFromGroup = exports.addNewGroupMembers = exports.updateLastSeenGroupChats = exports.updateLastSeenPrivateChats = exports.decrementContacts = exports.incrementContacts = exports.removeNewContactsActivityGroupChat = exports.removeNewContactsActivity = exports.addNewContactsActivityGroupChat = exports.addNewContactsActivity = exports.updatePinnedTimeStamp = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
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
exports.addNewContactsActivityGroupChat = functions.database
    .ref("groupChats/{chatKey}/members/unreadMessages/{memberKey}")
    .onCreate((snapshot, context) => {
    const { chatKey, memberKey } = context.params;
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    const updateData = {
        [`${contactsDatabaseRef(memberKey)}/newContactsActivity/${chatKey}`]: true,
        [`${contactsDatabaseRef(memberKey)}/contactsLastActivity/${chatKey}`]: timeStamp
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
exports.removeNewContactsActivityGroupChat = functions.database
    .ref("groupChats/{chatKey}/members/unreadMessages/{memberKey}")
    .onDelete((snapshot, context) => {
    const { chatKey, memberKey } = context.params;
    return database.ref(`users/${memberKey}/contactsDatabase/newContactsActivity/${chatKey}`).set(null);
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
exports.updateLastSeenPrivateChats = functions.database
    .ref("privateChats/{chatKey}/members/{memberKey}/status/isOnline")
    .onDelete(async (snapshot) => {
    var _a;
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    return (_a = snapshot.ref.parent) === null || _a === void 0 ? void 0 : _a.update({ lastSeen: timeStamp });
});
exports.updateLastSeenGroupChats = functions.database
    .ref("groupChats/{chatKey}/members/status/{memberKey}/isOnline")
    .onDelete(async (snapshot) => {
    var _a, _b;
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    const isMemberExists = await ((_a = snapshot.ref.parent) === null || _a === void 0 ? void 0 : _a.child("role").once("value"));
    if ((isMemberExists === null || isMemberExists === void 0 ? void 0 : isMemberExists.val()) === null)
        return;
    return (_b = snapshot.ref.parent) === null || _b === void 0 ? void 0 : _b.update({ lastSeen: timeStamp });
});
exports.addNewGroupMembers = functions.https.onCall(async (data, context) => {
    var _a;
    const authUid = (_a = context === null || context === void 0 ? void 0 : context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const { members, groupInfo } = data;
    if (!authUid) {
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    const membersUpdateData = {};
    const newMessageRef = database.ref(`groupChats/${groupInfo.key}/messages`).push();
    members.forEach((member) => {
        var _a;
        membersUpdateData[`groupChats/${groupInfo.key}/members/participants/${member.key}`] = true;
        membersUpdateData[`groupChats/${groupInfo.key}/members/status/${member.key}`] = {
            isOnline: false,
            userName: member.userName,
            userNameLowerCase: (_a = member.userName) === null || _a === void 0 ? void 0 : _a.toLowerCase(),
            role: "USER"
        };
        membersUpdateData[`users/${member.key}/contactsDatabase/contactsList/${groupInfo.key}/isGroupChat`] = true;
        membersUpdateData[`users/${member.key}/contactsDatabase/contactsList/${groupInfo.key}/groupName`] =
            groupInfo.groupName;
        membersUpdateData[`users/${member.key}/contactsDatabase/contactsList/${groupInfo.key}/role`] = "USER";
        membersUpdateData[`users/${member.key}/contactsDatabase/contactsList/${groupInfo.key}/removedFromGroup`] = false;
        membersUpdateData[`users/${member.key}/contactsDatabase/contactsLastActivity/${groupInfo.key}`] = timeStamp;
        membersUpdateData[`users/${member.key}/contactsDatabase/newContactsActivity/${groupInfo.key}`] = true;
    });
    try {
        const updateData = Object.assign(Object.assign({}, membersUpdateData), { [`groupChats/${groupInfo.key}/messages/${newMessageRef.key}`]: {
                newMembers: members,
                isNewMembers: true,
                timeStamp
            } });
        return database.ref().update(updateData);
    }
    catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
});
exports.removeMemberFromGroup = functions.https.onCall(async (data, context) => {
    var _a;
    const authUid = (_a = context === null || context === void 0 ? void 0 : context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const { member, groupChatKey } = data;
    if (!authUid) {
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    const newMessageRef = database.ref(`groupChats/${groupChatKey}/messages`).push();
    try {
        const updateData = {
            [`groupChats/${groupChatKey}/messages/${newMessageRef.key}`]: {
                removedMember: {
                    key: member.key,
                    userName: member.userName
                },
                isRemovedMember: true,
                timeStamp
            },
            [`groupChats/${groupChatKey}/members/participants/${member.key}`]: null,
            [`groupChats/${groupChatKey}/members/status/${member.key}`]: null,
            [`groupChats/${groupChatKey}/members/unreadMessages/${member.key}`]: null,
            [`users/${member.key}/contactsDatabase/contactsList/${groupChatKey}/removedFromGroup`]: true,
            [`users/${member.key}/contactsDatabase/newContactsActivity/${groupChatKey}`]: true,
            [`users/${member.key}/contactsDatabase/contactsLastActivity/${groupChatKey}`]: timeStamp
        };
        console.log({ removedMember: member.userName, data: updateData });
        return database.ref().update(updateData);
    }
    catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
});
exports.createNewGroup = functions.https.onCall(async (data, context) => {
    var _a;
    const authUid = (_a = context === null || context === void 0 ? void 0 : context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const { members, groupName, authUserName } = data;
    if (!authUid) {
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    const membersUpdateData = {};
    const groupChatRef = database.ref("groupChats").push();
    const newMessageRef = database.ref(`groupChats/${groupChatRef.key}/messages`).push();
    members.forEach((member) => {
        var _a;
        membersUpdateData[`groupChats/${groupChatRef.key}/members/participants/${member.key}`] = true;
        membersUpdateData[`groupChats/${groupChatRef.key}/members/status/${member.key}`] = {
            isOnline: false,
            userName: member.userName,
            userNameLowerCase: (_a = member.userName) === null || _a === void 0 ? void 0 : _a.toLowerCase(),
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
        const updateData = Object.assign(Object.assign({}, membersUpdateData), { [`groupChats/${groupChatRef.key}/members/participants/${authUid}`]: true, [`groupChats/${groupChatRef.key}/members/status/${authUid}`]: {
                isOnline: false,
                userName: authUserName,
                userNameLowerCase: authUserName === null || authUserName === void 0 ? void 0 : authUserName.toLowerCase(),
                role: "ADMIN"
            }, [`users/${authUid}/contactsDatabase/contactsList/${groupChatRef.key}`]: {
                pinned_lastActivityTS: "false",
                isGroupChat: true,
                groupName: groupName || "Nameless group wow",
                role: "ADMIN"
            }, [`users/${authUid}/contactsDatabase/contactsLastActivity/${groupChatRef.key}`]: timeStamp, [`groupChats/${groupChatRef.key}/messages/${newMessageRef.key}`]: {
                newMembers: members,
                isNewMembers: true,
                timeStamp
            }, [`groupChats/${groupChatRef.key}/info`]: {
                groupName: groupName || "Nameless group wow"
            } });
        return database
            .ref()
            .update(updateData)
            .then(() => {
            console.log({ newGroupChatKey: groupChatRef.key });
            return { newGroupChatKey: groupChatRef.key };
        });
    }
    catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
});
exports.newContactRequest = functions.https.onCall(async (data, context) => {
    var _a;
    const authUid = (_a = context === null || context === void 0 ? void 0 : context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const { contactUid, contactName, authUserName } = data;
    if (!authUid) {
        throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    try {
        const updateData = {
            [`${contactsDatabaseRef(authUid)}/contactsList/${contactUid}`]: {
                status: false,
                receiver: true,
                userName: contactName,
                userNameLowerCase: contactName.toLowerCase(),
                pinned_lastActivityTS: "false"
            },
            [`${contactsDatabaseRef(authUid)}/contactsLastActivity/${contactUid}`]: timeStamp,
            [`${contactsDatabaseRef(contactUid)}/newContactsRequests/${authUid}`]: true,
            [`${contactsDatabaseRef(contactUid)}/contactsLastActivity/${authUid}`]: timeStamp,
            [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}`]: {
                status: false,
                receiver: false,
                userName: authUserName,
                userNameLowerCase: authUserName === null || authUserName === void 0 ? void 0 : authUserName.toLowerCase(),
                pinned_lastActivityTS: "false"
            }
        };
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
    const chatKey = contactUid < authUid ? `${contactUid}_${authUid}` : `${authUid}_${contactUid}`;
    const newMessageRef = database.ref(`privateChats/${chatKey}/messages`).push();
    try {
        const updateData = {
            [`users/${contactsDatabaseRef(authUid)}/contactsList/${authPathToUpdate}`]: status === "accept" ? true : null,
            [`users/${contactsDatabaseRef(authUid)}/newContactsRequests/${contactUid}`]: null,
            [`users/${contactsDatabaseRef(authUid)}/contactsLastActivity/${contactUid}`]: status === "accept" ? timeStamp : null,
            [`users/${contactsDatabaseRef(contactUid)}/contactsList/${authUid}/status`]: status === "accept" ? true : "rejected",
            [`users/${contactsDatabaseRef(contactUid)}/newContactsActivity/${authUid}`]: true,
            [`users/${contactsDatabaseRef(contactUid)}/contactsLastActivity/${authUid}`]: timeStamp,
            [`privateChats/${chatKey}/messages/${newMessageRef.key}`]: status === "accept"
                ? {
                    isNowContacts: true,
                    timeStamp
                }
                : null
        };
        return database.ref().update(updateData);
    }
    catch (error) {
        throw new functions.https.HttpsError("unknown", error.message, error);
    }
});
//# sourceMappingURL=index.js.map