"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleContactRequest = exports.newContactRequest = exports.createNewGroup = exports.removeMemberFromGroup = exports.addNewGroupMembers = exports.updateLastSeenGroupChats = exports.updateLastSeenPrivateChats = exports.decrementContacts = exports.incrementContacts = exports.removeNewContactsActivityGroupChat = exports.removeNewContactsActivity = exports.addNewContactsActivityGroupChat = exports.addNewContactsActivity = exports.updatePinnedTimeStamp = exports.updateAllEpisodesWatchedUserDatabase = exports.updateShowStatusForUserDatabase = exports.updateShowEpisodesForUserDatabase = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const helpers_1 = require("./helpers");
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const admin = require("firebase-admin");
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
const isApiError = (x) => {
    return typeof x.message === "string";
};
const contactsDatabaseRef = (uid) => `${uid}/contactsDatabase`;
exports.updateShowEpisodesForUserDatabase = functions.database
    .ref("allShowsList/{showId}/episodes")
    .onUpdate(async (change, context) => {
    var _a, _b;
    const { showId } = context.params;
    const afterData = change.after;
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    const showEpisodesFireData = (_a = afterData.val()) !== null && _a !== void 0 ? _a : [];
    const usersWatchingSnapshot = await ((_b = afterData.ref.parent) === null || _b === void 0 ? void 0 : _b.child("usersWatchingList").once("value"));
    const usersWatchingKeys = Object.keys(usersWatchingSnapshot === null || usersWatchingSnapshot === void 0 ? void 0 : usersWatchingSnapshot.val());
    const updateData = {};
    const usersEpisodesSnapshot = await Promise.all(usersWatchingKeys.map(async (userUid) => {
        return database.ref(`users/${userUid}/content/episodes/${showId}/episodes`).once("value");
    }));
    usersEpisodesSnapshot.forEach(async (episodesSnapshot, index) => {
        var _a;
        const showEpisodesUserData = (_a = episodesSnapshot.val()) !== null && _a !== void 0 ? _a : [];
        const mergedEpisodes = (0, helpers_1.mergeEpisodesFromFireDBwithUserDB)(showEpisodesFireData, showEpisodesUserData);
        updateData[`users/${usersWatchingKeys[index]}/content/episodes/${showId}/episodes`] = mergedEpisodes;
        updateData[`users/${usersWatchingKeys[index]}/content/showsLastUpdateList/${showId}/lastUpdatedInUser`] =
            timeStamp;
    });
    return database.ref().update(updateData);
});
exports.updateShowStatusForUserDatabase = functions.database
    .ref("allShowsList/{showId}/status")
    .onUpdate(async (change, context) => {
    var _a;
    const { showId } = context.params;
    const afterData = change.after;
    const showStatusLowerCase = afterData.val().toLowerCase();
    const showStatusForUserDatabase = showStatusLowerCase === "ended" || showStatusLowerCase === "canceled" ? "ended" : "ongoing";
    const usersWatchingSnapshot = await ((_a = afterData.ref.parent) === null || _a === void 0 ? void 0 : _a.child("usersWatchingList").once("value"));
    const usersWatchingKeys = Object.keys(usersWatchingSnapshot === null || usersWatchingSnapshot === void 0 ? void 0 : usersWatchingSnapshot.val());
    const updateData = {};
    usersWatchingKeys.forEach((userUid) => {
        updateData[`users/${userUid}/content/shows/${showId}/status`] = showStatusForUserDatabase;
    });
    return database.ref().update(updateData);
});
exports.updateAllEpisodesWatchedUserDatabase = functions.database
    .ref("users/{uid}/content/showsLastUpdateList/{showId}")
    .onUpdate(async (change, context) => {
    var _a;
    const { showId } = context.params;
    const afterData = change.after;
    const contentRef = (_a = afterData.ref.parent) === null || _a === void 0 ? void 0 : _a.parent;
    const showsRef = contentRef === null || contentRef === void 0 ? void 0 : contentRef.child("shows");
    const showEpisodesUserSnapshot = await (contentRef === null || contentRef === void 0 ? void 0 : contentRef.child(`episodes/${showId}/episodes`).once("value"));
    const showEpisodesUserData = showEpisodesUserSnapshot === null || showEpisodesUserSnapshot === void 0 ? void 0 : showEpisodesUserSnapshot.val();
    const isAnyEpisodeNotWatched = (0, helpers_1.episodesToOneArray)(showEpisodesUserData).some((episode) => !episode.watched);
    return showsRef === null || showsRef === void 0 ? void 0 : showsRef.child(`${showId}`).update({ allEpisodesWatched: !isAnyEpisodeNotWatched });
});
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
    const updateData = {
        [`${contactsDatabaseRef(memberKey)}/newContactsActivity/${otherMemberKey}`]: true
    };
    return database.ref("users").update(updateData);
});
exports.addNewContactsActivityGroupChat = functions.database
    .ref("groupChats/{chatKey}/members/unreadMessages/{memberKey}")
    .onCreate((snapshot, context) => {
    const { chatKey, memberKey } = context.params;
    const updateData = {
        [`${contactsDatabaseRef(memberKey)}/newContactsActivity/${chatKey}`]: true
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
        if (isApiError(error)) {
            throw new functions.https.HttpsError("unknown", error.message, error);
        }
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
        return database.ref().update(updateData);
    }
    catch (error) {
        if (isApiError(error)) {
            throw new functions.https.HttpsError("unknown", error.message, error);
        }
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
        if (isApiError(error)) {
            throw new functions.https.HttpsError("unknown", error.message, error);
        }
        else {
            return;
        }
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
        if (isApiError(error)) {
            throw new functions.https.HttpsError("unknown", error.message, error);
        }
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
        if (isApiError(error)) {
            throw new functions.https.HttpsError("unknown", error.message, error);
        }
    }
});
//# sourceMappingURL=index.js.map