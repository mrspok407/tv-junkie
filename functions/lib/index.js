"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onShowUpdate = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const database = admin.database();
exports.onShowUpdate = functions.database
    .ref("users/{uid}/content/shows/{showId}")
    .onUpdate((change, context) => {
    const uid = context.params.uid;
    const showId = context.params.showId;
    console.log({ uid, showId });
    const beforeDatabase = change.before.val();
    const afterDatabase = change.after.val();
    database
        .ref(`users/${uid}/content/shows`)
        .orderByKey()
        .equalTo("82856")
        .once("value", (snapshot) => {
        console.log(snapshot.val());
    });
    if (beforeDatabase.database === afterDatabase.database)
        return null;
    return change.after.ref.update({
        previousDatabase: beforeDatabase.database,
        time: admin.database.ServerValue.TIMESTAMP
    });
});
//# sourceMappingURL=index.js.map