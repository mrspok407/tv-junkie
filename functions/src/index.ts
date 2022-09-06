import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {mergeEpisodesFromFireDBwithUserDB, validEpisodesToOneArray} from "./helpers";
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

interface GroupChatInfoInterface {
  [key: string]: string | boolean;
}

interface GroupChatMemberStatusInterface {
  [key: string]: string | boolean;
}

interface ApiError {
  message: string;
}

const isApiError = (x: any): x is ApiError => {
  return typeof x.message === "string";
};

const contactsDatabaseRef = (uid: string) => `${uid}/contactsDatabase`;

export const updateShowEpisodesForUserDatabase = functions.database
  .ref("allShowsList/{showId}/lastUpdatedTimestamp")
  .onUpdate(async (change, context) => {
    const {showId} = context.params;
    const afterData = change.after;

    const episodesRef = await afterData.ref.parent?.child("episodes").once("value");

    const timeStamp = admin.database.ServerValue.TIMESTAMP;

    const showEpisodesFireData = episodesRef?.val() ?? [];
    const usersWatchingSnapshot = await afterData.ref.parent?.child("usersWatchingList").once("value");
    if (usersWatchingSnapshot?.val() === null) return;

    const usersWatchingKeys = Object.keys(usersWatchingSnapshot?.val());

    const updateData: {[key: string]: any} = {};

    const usersEpisodesSnapshot = await Promise.all(
      usersWatchingKeys.map((userUid) => {
        return database.ref(`users/${userUid}/content/episodes/${showId}/episodes`).once("value");
      })
    );

    usersEpisodesSnapshot.forEach((episodesSnapshot, index) => {
      const showEpisodesUserData = episodesSnapshot.val() ?? [];
      const mergedEpisodes = mergeEpisodesFromFireDBwithUserDB(showEpisodesFireData, showEpisodesUserData);

      updateData[`users/${usersWatchingKeys[index]}/content/episodes/${showId}/episodes`] = mergedEpisodes;
      updateData[`users/${usersWatchingKeys[index]}/content/showsLastUpdateList/${showId}/lastUpdatedInUser`] =
        timeStamp;
    });

    return database.ref().update(updateData);
  });

export const updateShowStatusForUserDatabase = functions.database
  .ref("allShowsList/{showId}/status")
  .onUpdate(async (change, context) => {
    const {showId} = context.params;
    const afterData = change.after;

    const showStatusLowerCase = afterData.val().toLowerCase();
    const showStatusForUserDatabase =
      showStatusLowerCase === "ended" || showStatusLowerCase === "canceled" ? "ended" : "ongoing";

    const usersWatchingSnapshot = await afterData.ref.parent?.child("usersWatchingList").once("value");
    if (usersWatchingSnapshot?.val() === null) return;

    const usersWatchingKeys = Object.keys(usersWatchingSnapshot?.val());

    const updateData: {[key: string]: any} = {};
    usersWatchingKeys.forEach((userUid) => {
      updateData[`users/${userUid}/content/shows/${showId}/status`] = showStatusForUserDatabase;
    });

    return database.ref().update(updateData);
  });

export const updateAllEpisodesWatchedUserDatabase = functions.database
  .ref("users/{uid}/content/showsLastUpdateList/{showId}")
  .onUpdate(async (change, context) => {
    const {showId} = context.params;
    const afterData = change.after;

    const contentRef = afterData.ref.parent?.parent;
    const showsRef = contentRef?.child("shows");

    const showEpisodesUserSnapshot = await contentRef?.child(`episodes/${showId}/episodes`).once("value");
    const showEpisodesUserData = showEpisodesUserSnapshot?.val();
    const isAnyEpisodeNotWatched = validEpisodesToOneArray(showEpisodesUserData).some(
      (episode: any) => !episode.watched
    );

    return showsRef?.child(`${showId}`).update({allEpisodesWatched: !isAnyEpisodeNotWatched});
  });

export const updateAllShowsListIdsCreate = functions.database
  .ref("allShowsList/{showId}/id")
  .onCreate(async (snapshot, context) => {
    const {showId} = context.params;
    database.ref(`allShowsListIds/${showId}`).set(true);
  });

export const updateAllShowsListIdsDelete = functions.database
  .ref("allShowsList/{showId}/id")
  .onDelete(async (snapshot, context) => {
    const {showId} = context.params;
    database.ref(`allShowsListIds/${showId}`).set(null);
  });

export const updatePinnedTimeStamp = functions.database
  .ref("users/{authUid}/contactsDatabase/contactsLastActivity/{contactUid}")
  .onWrite(async (change, context) => {
    const {authUid, contactUid} = context.params;
    const afterData = change.after;
    const beforeData = change.before;

    const contactRef = database.ref(`users/${contactsDatabaseRef(authUid)}/contactsList/${contactUid}`);
    const timeStamp = afterData.val();

    if (!afterData.exists()) return;

    if (!beforeData.exists()) {
      return contactRef.update({
        pinned_lastActivityTS: `false_${timeStamp}`
      });
    }

    if (beforeData.val() !== afterData.val()) {
      const isPinnedData = await contactRef.child("pinned_lastActivityTS").once("value");
      const isPinned = !!(isPinnedData?.val().slice(0, 4) === "true");
      console.log(`${isPinned}_${timeStamp}`);
      return contactRef.update({
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

    const updateData = {
      [`${contactsDatabaseRef(memberKey)}/newContactsActivity/${otherMemberKey}`]: true
    };

    return database.ref("users").update(updateData);
  });

export const addNewContactsActivityGroupChat = functions.database
  .ref("groupChats/{chatKey}/members/unreadMessages/{memberKey}")
  .onCreate((snapshot, context) => {
    const {chatKey, memberKey} = context.params;
    const updateData = {
      [`${contactsDatabaseRef(memberKey)}/newContactsActivity/${chatKey}`]: true
    };

    return database.ref("users").update(updateData);
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

export const removeNewContactsActivityGroupChat = functions.database
  .ref("groupChats/{chatKey}/members/unreadMessages/{memberKey}")
  .onDelete((snapshot, context) => {
    const {chatKey, memberKey} = context.params;
    return database.ref(`users/${memberKey}/contactsDatabase/newContactsActivity/${chatKey}`).set(null);
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

export const updateLastSeenPrivateChats = functions.database
  .ref("privateChats/{chatKey}/members/{memberKey}/status/isOnline")
  .onDelete(async (snapshot) => {
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    return snapshot.ref.parent?.update({lastSeen: timeStamp});
  });

export const updateLastSeenGroupChats = functions.database
  .ref("groupChats/{chatKey}/members/status/{memberKey}/isOnline")
  .onDelete(async (snapshot) => {
    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    const isMemberExists = await snapshot.ref.parent?.child("role").once("value");
    if (isMemberExists?.val() === null) return;
    return snapshot.ref.parent?.update({lastSeen: timeStamp});
  });

export const addNewGroupMembers = functions.https.onCall(
  async (
    data: {
      members: {key: string; userName: string}[];
      groupInfo: {groupName: string; key: string};
    },
    context
  ) => {
    const authUid = context?.auth?.uid;
    const {members, groupInfo} = data;

    if (!authUid) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const timeStamp = admin.database.ServerValue.TIMESTAMP;

    const membersUpdateData: any = {};
    const newMessageRef = database.ref(`groupChats/${groupInfo.key}/messages`).push();

    members.forEach((member) => {
      membersUpdateData[`groupChats/${groupInfo.key}/members/participants/${member.key}`] = true;
      membersUpdateData[`groupChats/${groupInfo.key}/members/status/${member.key}`] = {
        isOnline: false,
        userName: member.userName,
        userNameLowerCase: member.userName?.toLowerCase(),
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
      const updateData: {[key: string]: GroupChatInfoInterface | GroupChatMemberStatusInterface} = {
        ...membersUpdateData,
        [`groupChats/${groupInfo.key}/messages/${newMessageRef.key}`]: {
          newMembers: members,
          isNewMembers: true,
          timeStamp
        }
      };
      return database.ref().update(updateData);
    } catch (error) {
      if (isApiError(error)) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      }
    }
  }
);

export const removeMemberFromGroup = functions.https.onCall(async (data, context) => {
  const authUid = context?.auth?.uid;
  const {member, groupChatKey} = data;

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
  } catch (error) {
    if (isApiError(error)) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
});

export const createNewGroup = functions.https.onCall(
  async (data: {members: {key: string; userName: string}[]; groupName: string; authUserName: string}, context) => {
    const authUid = context?.auth?.uid;
    const {members, groupName, authUserName} = data;

    if (!authUid) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const timeStamp = admin.database.ServerValue.TIMESTAMP;

    const membersUpdateData: any = {};
    const groupChatRef = database.ref("groupChats").push();
    const newMessageRef = database.ref(`groupChats/${groupChatRef.key}/messages`).push();
    members.forEach((member) => {
      membersUpdateData[`groupChats/${groupChatRef.key}/members/participants/${member.key}`] = true;
      membersUpdateData[`groupChats/${groupChatRef.key}/members/status/${member.key}`] = {
        isOnline: false,
        userName: member.userName,
        userNameLowerCase: member.userName?.toLowerCase(),
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
      const updateData: {[key: string]: GroupChatInfoInterface | GroupChatMemberStatusInterface} = {
        ...membersUpdateData,
        [`groupChats/${groupChatRef.key}/members/participants/${authUid}`]: true,
        [`groupChats/${groupChatRef.key}/members/status/${authUid}`]: {
          isOnline: false,
          userName: authUserName,
          userNameLowerCase: authUserName?.toLowerCase(),
          role: "ADMIN"
        },
        [`users/${authUid}/contactsDatabase/contactsList/${groupChatRef.key}`]: {
          pinned_lastActivityTS: "false",
          isGroupChat: true,
          groupName: groupName || "Nameless group wow",
          role: "ADMIN"
        },
        [`users/${authUid}/contactsDatabase/contactsLastActivity/${groupChatRef.key}`]: timeStamp,
        [`groupChats/${groupChatRef.key}/messages/${newMessageRef.key}`]: {
          newMembers: members,
          isNewMembers: true,
          timeStamp
        },
        [`groupChats/${groupChatRef.key}/info`]: {
          groupName: groupName || "Nameless group wow"
        }
      };
      return database
        .ref()
        .update(updateData)
        .then(() => {
          console.log({newGroupChatKey: groupChatRef.key});
          return {newGroupChatKey: groupChatRef.key};
        });
    } catch (error) {
      if (isApiError(error)) {
        throw new functions.https.HttpsError("unknown", error.message, error);
      } else {
        return;
      }
    }
  }
);

export const newContactRequest = functions.https.onCall(async (data, context) => {
  const authUid = context?.auth?.uid;
  const {contactUid, contactName, authUserName} = data;

  if (!authUid) {
    throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
  }

  const timeStamp = admin.database.ServerValue.TIMESTAMP;

  try {
    const updateData: any = {
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
        userNameLowerCase: authUserName?.toLowerCase(),
        pinned_lastActivityTS: "false"
      }
    };

    return database.ref("users").update(updateData);
  } catch (error) {
    if (isApiError(error)) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
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

  const chatKey = contactUid < authUid ? `${contactUid}_${authUid}` : `${authUid}_${contactUid}`;
  const newMessageRef = database.ref(`privateChats/${chatKey}/messages`).push();

  try {
    const updateData = {
      [`users/${contactsDatabaseRef(authUid)}/contactsList/${authPathToUpdate}`]: status === "accept" ? true : null,
      [`users/${contactsDatabaseRef(authUid)}/newContactsRequests/${contactUid}`]: null,
      [`users/${contactsDatabaseRef(authUid)}/contactsLastActivity/${contactUid}`]:
        status === "accept" ? timeStamp : null,
      [`users/${contactsDatabaseRef(contactUid)}/contactsList/${authUid}/status`]:
        status === "accept" ? true : "rejected",
      [`users/${contactsDatabaseRef(contactUid)}/newContactsActivity/${authUid}`]: true,
      [`users/${contactsDatabaseRef(contactUid)}/contactsLastActivity/${authUid}`]: timeStamp,
      [`privateChats/${chatKey}/messages/${newMessageRef.key}`]:
        status === "accept"
          ? {
              isNowContacts: true,
              timeStamp
            }
          : null
    };

    return database.ref().update(updateData);
  } catch (error) {
    if (isApiError(error)) {
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
});
