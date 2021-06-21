const functions = require("firebase-functions");
// The Firebase Admin SDK to access Firestore.
//const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
//admin.initializeApp();
require('dotenv').config()

//for fire store
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.

const { SENDER_EMAIL, SENDER_PASSWORD } = process.env;

exports.test = functions.database.ref("/devices/{device_ID}/history/{alert_ID}")
  .onWrite((snapshot, context) => {
    const { before, after } = snapshot;

    if (before.val() == null) {//New alert created
      functions.logger.info('context.params.device_ID=', context.params.device_ID);
      //Get the user's ID from the device ID:
      const uidReff = db.collection('deviceToUid').doc(context.params.device_ID).get().then((uidRef) => {
        if (!uidRef.exists) {
          console.log('No such document!');
          return null;
        } else {
          console.log('Document data[deviceID]:', uidRef.data()[context.params.device_ID]);
          //Get the user's email from the user's ID:
          const emailRef = db.collection('users').doc(uidRef.data()[context.params.device_ID]).collection('user-info').get().then((doc) => {
            doc.forEach((emailAddress) => {
              console.log('email=', emailAddress.id);
              //Send alert email to the user's email:
              const mailTransport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: SENDER_EMAIL,
                  pass: SENDER_PASSWORD,
                },
              });
              var mailOptions = {
                from: 'CNSS <noreply@firebase.com',
                to: emailAddress.id,
                subject: 'Sending Email using Node.js',
                text: 'That was easy!'
              };
              mailTransport.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
              return emailAddress.id;
            });
          });
        }
      });
      functions.logger.info('created event');
      return;
    }
    if (after.val() == null) {
      functions.logger.info('deleted event');
      return;
    }
    else {
      functions.logger.info('update event');
      return;
    }
  });

function getUidFromDeviceID(deviceID) {
  const uidRef = db.collection('deviceToUid').doc(deviceID).get().then(() => {
    if (!uidRef.exists) {
      console.log('getUidFromDeviceID No such document!');
      return null;
    } else {
      console.log('getUidFromDeviceID Document data[deviceID]:', uidRef.data()[deviceID]);

      return uidRef.data()[deviceID];//the Uid
    }
  });
}

function getEmailFromUid(uid) {
  const emailRef = db.collection('users').doc(uid).collection('user-info').get().forEach((doc) => {
    //console.log(doc.data()); // For data inside doc
    console.log('doc.id=', doc.id); // For doc name
    return doc.id;
  });
  return null;
}
