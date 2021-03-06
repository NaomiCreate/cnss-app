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

const { SENDER_EMAIL, SENDER_PASSWORD } = process.env;

exports.test = functions.database.ref("/devices/{device_ID}/history/{alert_ID}")
  .onWrite(
    async (snapshot, context) => { 
      await sendMail(snapshot, context);
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

      // get users contact
      const contactRef = db.collection('users').doc(uidDoc.data()[context.params.device_ID]).collection('contacts');

      const [userInfo, contactList] =  await Promise.all([userRef.get(), contactRef.get()]);

      if(userInfo.empty){
        functions.logger.info("No such collection (1)!");
        return;
      }

      const email = userInfo.docs[0].id; // owners email
      const firstName =  userInfo.docs[0].data().firstName;
      const lastName = userInfo.docs[0].data().lastName;
      const phone = userInfo.docs[0].data().phone;

      
      if(contactList.empty){
        functions.logger.info("No such collection (2)!");
      }

      let contacts = contactList.docs
                      .filter((doc) => doc.data().confirmed)
                      .map((doc) => doc.id);
     

      console.log("DEBUG:: CONTACTS:", contacts);
      

      const mailTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: SENDER_EMAIL,
          pass: SENDER_PASSWORD,
        },
      });

    
      console.log('DEBUG:: FROM: ',SENDER_EMAIL);
      console.log('DEBUG:: TO: ', email);


      const mailOptions = {
        from: 'CNSS <noreply@firebase.com>',
        to: email,
        bcc: contacts,
        subject: `${firstName} ${lastName} | CNSS device | Motion detected`,
        html: `<p dir=ltr>Suspicious movement detected from ${firstName} ${lastName}'s CNSS device,<br>
              please check it out.<br>
              Contact details:<br>
              Phone: ${phone}<br>
              Email: ${email}<br></p>`
        
      };

      mailTransport.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }
  }

  



