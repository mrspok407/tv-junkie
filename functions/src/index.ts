import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const database = admin.database();

export const onShowUpdate = functions.database
  .ref("users/{uid}/content/shows/{showId}")
  .onUpdate((change, context) => {
    const uid = context.params.uid;
    const showId = context.params.showId;
    console.log({uid, showId});
    const beforeDatabase = change.before.val();
    const afterDatabase = change.after.val();

    database
      .ref(`users/${uid}/content/shows`)
      .orderByKey()
      .equalTo("82856")
      .once("value", (snapshot) => {
        console.log(snapshot.val());
      });

    if (beforeDatabase.database === afterDatabase.database) return null;

    return change.after.ref.update({
      previousDatabase: beforeDatabase.database,
      time: admin.database.ServerValue.TIMESTAMP
    });
  });
