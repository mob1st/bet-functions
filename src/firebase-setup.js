
const GOOGLE_CLOUD_PROJECT = process.env['GOOGLE_CLOUD_PROJECT'];
const CLOUD_BUCKET = GOOGLE_CLOUD_PROJECT + '_bucket';

const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore, Timestamp, DocumentReference } = require("firebase-admin/firestore");
const { getStorage } = require('firebase-admin/storage');

const firebaseApp = initializeApp({
    credential: applicationDefault(),
});

const firestore = getFirestore();
const bucket = getStorage().bucket;

module.exports = {
    firebaseApp,
    firestore,
    bucket,
    Timestamp,
    DocumentReference
};