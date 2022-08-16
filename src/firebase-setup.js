const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore, Timestamp, DocumentReference } = require("firebase-admin/firestore");
const { getStorage } = require('firebase-admin/storage');
const STORAGE_BUCKET = `${process.env.GOOGLE_PROJECT_ID}.appspot.com`;
const PUBLIC_STORAGE_URL = `https://storage.googleapis.com/${STORAGE_BUCKET}`;

const firebaseApp = initializeApp({
    credential: applicationDefault(),
    storageBucket: STORAGE_BUCKET
});
const firestore = getFirestore();
const storage = getStorage();

module.exports = {
    // instances
    firebaseApp,    
    firestore,
    storage,

    // types
    Timestamp,
    DocumentReference,    

    // constants,
    PUBLIC_STORAGE_URL
};