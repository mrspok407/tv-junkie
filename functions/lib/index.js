"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callableFunctionTest = exports.onShowUpdate = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Cloud Functions interesting points:
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
admin.initializeApp();
const database = admin.database();
exports.onShowUpdate = functions.database
    .ref("users/{uid}/content/shows/{showId}")
    .onUpdate(async (change, context) => {
    const uid = context.params.uid;
    const showId = context.params.showId;
    console.log({ uid, showId });
    const beforeDatabase = change.before.val();
    const afterDatabase = change.after.val();
    try {
        await database
            .ref(`users/${uid}/content/shows`)
            .orderByKey()
            .equalTo("82856")
            .once("value", (snapshot) => {
            console.log(snapshot.val());
        });
    }
    catch (err) {
        console.log(err);
    }
    if (beforeDatabase.database === afterDatabase.database)
        return null;
    return change.after.ref.update({
        previousDatabase: beforeDatabase.database,
        time: admin.database.ServerValue.TIMESTAMP
    });
});
exports.callableFunctionTest = functions.https.onCall((data) => {
    console.log(data);
    return "ttttttttt";
});
//# sourceMappingURL=index.js.map