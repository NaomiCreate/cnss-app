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

//1624368667048

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.

const { SENDER_EMAIL, SENDER_PASSWORD } = process.env;

exports.test = functions.database.ref("/devices/{device_ID}/history/{alert_ID}")
  .onWrite(
    (snapshot, context) => { 

      console.log('DEBUG:: IN ONWRITE');
      sendMail(snapshot, context);

      return true;
    }
  );

  async function sendMail(snapshot, context){

    const { before, after } = snapshot;

    // new alert created
    if (before.val() == null) {

      console.log('DEBUG:: NEW ALERT');

      // get owners uID from device ID
      const deviceRef = db.collection('deviceToUid').doc(context.params.device_ID);
      const uidDoc = await deviceRef.get();

      if(!uidDoc.exists){
        functions.logger.info("No such document!");
        return;
      }


      // get users email from uID
      const userRef = db.collection('users').doc(uidDoc.data()[context.params.device_ID]).collection('user-info');
      const userInfo = await userRef.get();

      if(userInfo.empty){
        functions.logger.info("No such collection!");
        return;
      }

      const email = userInfo.docs[0].id; // owners email

      const mailTransport = nodemailer.createTransport({
        service: 'gmail',
        // host: 'smtp.gmail.com',
        // port: 465,
        // secure: true, 
        auth: {
          user: SENDER_EMAIL,
          pass: SENDER_PASSWORD,
        },
      });
    
      console.log('DEBUG:: FROM: ',SENDER_EMAIL);
      console.log('DEBUG:: TO: ', email);

      const mailOptions = {
        from: 'CNSS <noreply@firebase.com',
        to: email,
        subject: 'Sending Email using Node.js',
        text: 'Another email, for testing'
      };

      mailTransport.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          console.log("Message sent: ", info.messageId);
        }
      });
    }
  }

  



