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

// interface ContactInfoInterface {
//   [key: string]: string | boolean | number | unknown;
//   status: boolean;
//   receiver?: boolean;
//   userName?: string;
//   userNameLowerCase?: string;
//   timeStamp: unknown;
// }

// interface ContactRequestDataInterface {
//   [key: string]: ContactInfoInterface | boolean;
// }

interface GroupChatInfoInterface {
  [key: string]: string | boolean;
}

interface GroupChatMemberStatusInterface {
  [key: string]: string | boolean;
}

const contactsDatabaseRef = (uid: string) => `${uid}/contactsDatabase`;

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

    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    const updateData = {
      [`${contactsDatabaseRef(memberKey)}/newContactsActivity/${otherMemberKey}`]: true,
      [`${contactsDatabaseRef(memberKey)}/contactsLastActivity/${otherMemberKey}`]: timeStamp
    };

    return database.ref("users").update(updateData);
  });

export const addNewContactsActivityGroupChat = functions.database
  .ref("groupChats/{chatKey}/members/unreadMessages/{memberKey}")
  .onCreate((snapshot, context) => {
    const {chatKey, memberKey} = context.params;

    const timeStamp = admin.database.ServerValue.TIMESTAMP;
    const updateData = {
      [`${contactsDatabaseRef(memberKey)}/newContactsActivity/${chatKey}`]: true,
      [`${contactsDatabaseRef(memberKey)}/contactsLastActivity/${chatKey}`]: timeStamp
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
      members: {key: string; username: string}[];
      groupInfo: {groupName: string; key: string};
      authUser: {username: string};
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
        username: member.username,
        usernameLowerCase: member.username?.toLowerCase(),
        role: "USER"
      };
      membersUpdateData[`users/${member.key}/contactsDatabase/contactsList/${groupInfo.key}`] = {
        pinned_lastActivityTS: "false",
        isGroupChat: true,
        groupName: groupInfo.groupName,
        role: "USER",
        removedFromGroup: false
      };
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
      throw new functions.https.HttpsError("unknown", error.message, error);
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
          username: member.username
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
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});

export const createNewGroup = functions.https.onCall(
  async (
    data: {members: {key: string; username: string}[]; groupName: string; authUser: {username: string}},
    context
  ) => {
    const authUid = context?.auth?.uid;
    const {members, groupName, authUser} = data;

    if (!authUid) {
      throw new functions.https.HttpsError("failed-precondition", "The function must be called while authenticated.");
    }

    const timeStamp = admin.database.ServerValue.TIMESTAMP;

    const membersUpdateData: any = {};
    const groupChatRef = database.ref("groupChats").push();
    const newMessageRef = database.ref(`groupChats/${groupChatRef.key}/messages`).push();
    members.forEach((member) => {
      (membersUpdateData[`groupChats/${groupChatRef.key}/members/participants/${member.key}`] = true),
        (membersUpdateData[`groupChats/${groupChatRef.key}/members/status/${member.key}`] = {
          isOnline: false,
          username: member.username,
          usernameLowerCase: member.username?.toLowerCase(),
          role: "USER"
        });
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
        [`groupChats/${groupChatRef.key}/members/status${authUid}`]: {
          isOnline: false,
          username: authUser?.username,
          usernameLowerCase: authUser?.username?.toLowerCase(),
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
      throw new functions.https.HttpsError("unknown", error.message, error);
    }
  }
);

export const newContactRequest = functions.https.onCall(async (data, context) => {
  const authUid = context?.auth?.uid;
  const {contactUid, contactName, authUser} = data;

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
      [`${contactsDatabaseRef(contactUid)}/contactsList/${authUid}`]: {
        status: false,
        receiver: false,
        userName: authUser.username.val(),
        userNameLowerCase: authUser.username.toLowerCase(),
        pinned_lastActivityTS: "false"
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
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});
