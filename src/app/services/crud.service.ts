import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { AngularFireDatabase, snapshotChanges } from '@angular/fire/database';
//import { userInfo } from 'os';

//For real time data base
import { RealTimeService } from '../services/real-time.service';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  static isOwner:any;


  constructor(private authservice: AuthService, public fireservices:AngularFirestore,private db: AngularFireDatabase) { }

  //--------------------------------------xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  

//For real time data base
  device_listed(device_id: string,is_device_owner:boolean){

    if(is_device_owner == true)
    {
      let dbPath = `/device-list/` + 'device_id';//beginig of path to realtime database
      let dbData = this.db.list(dbPath).snapshotChanges()
      .subscribe(data => {
        if(data[0]==undefined)
          return true;
        else{
          return false;
        }
      })
    }

  }
 
  
//--------------------------------------xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  //create_userInfo adds to the collection 'user-info', a document in firebase, that including details about the registrant 
  create_userInfo(RecordUserInfo)
  { 
    //return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('user-info').add(RecordUserInfo);
    return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('user-info').doc(RecordUserInfo.email).set(RecordUserInfo);//added in 8.3.21

  }

  /* This function will add to collection emailToUid a record  [email:uid] of current resitration */
  add_EmailToUid(email:string)
  {
    let record = {}
    record[email] = this.authservice.currentUserId;
    return this.fireservices.collection('emailToUid').doc(email).set(record);
  }

    /* This function will add to collection emailToUid a record  [email:uid] of current resitration */
    add_deviceToUid(deviceID:string)
    {
      let record = {}
      record[deviceID] = this.authservice.currentUserId
      return this.fireservices.collection('deviceToUid').doc(deviceID).set(record);
    }

  get_uidFromEmail(email:string)
  {
    return this.fireservices.collection('emailToUid').doc(email).get().toPromise()
  }



  get_userInfo()
  {
    return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('user-info').snapshotChanges();  
  }

  update_user(recordId, record)
  {
    this.fireservices.doc('users/'+this.authservice.currentUserId + '/' + 'user-info/' + recordId).update(record);//'contacts' is the collection name
    //this.fireservices.doc('users/'+this.authservice.currentUserId + '/' + 'user-info/' + recordId).update(record);//'contacts' is the collection name
            //this.fireservices.doc('contacts/' + recordId).update(record);//'contacts' is the collection name//-before change
  }
  //--------

  update_connectedTo(uid:string,shareHistory:boolean)
  {
     /*Update Record[uid] conected-to*/  
    let record = {}
    //record[this.authservice.currentUserId] = true;
    record["id"] = this.authservice.currentUserId;
    record["shareHistory"] = shareHistory;
    return this.fireservices.collection('users').doc(uid).collection('connected-to').doc(this.authservice.currentUserName).set(record);
  }


  //create_NewContact adds to the 'contacts' collection in firebase, the contact that the user entered as input
  create_NewContact(Record)
  {
    /*Update contact-list with new record*/
    return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('contacts').doc(Record['email']).set(Record);
            
  }

  //get_AllContacts gets the 'contacts' collection from firebase
  get_AllContacts()
  {

    return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('contacts').snapshotChanges();
    //return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('contacts').get().toPromise();

    //return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('contacts').get().toPromise();

  }

  get_contact_details(email:string,uid:string){
    return this.fireservices.collection('users').doc(uid).collection('user-info').doc(email).get().toPromise();

    // return this.fireservices.collection('users').doc(uid).collection('user-info').doc('Klo7isEJZimqZNqsuMFm').get().toPromise()  //.get().toPromise();
//    return this.fireservices.collection('users').doc(uid).collection('user-info').doc('Klo7isEJZimqZNqsuMFm').get().toPromise()  //.get().toPromise();

  }

  get_contact_details_with_shareHistory(email:string,uid:string){
    return this.fireservices.collection('users').doc(uid).collection('contacts').doc("email").get().toPromise();

    // return this.fireservices.collection('users').doc(uid).collection('user-info').doc('Klo7isEJZimqZNqsuMFm').get().toPromise()  //.get().toPromise();
//    return this.fireservices.collection('users').doc(uid).collection('user-info').doc('Klo7isEJZimqZNqsuMFm').get().toPromise()  //.get().toPromise();

  }

  get_AllConnections()
  {
    return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('connected-to').snapshotChanges();
  }

  
  //update_contact will update the contact detailes in firebase. (the function gets the record id and the new data)
  update_contact(email,  record)
  {
    this.fireservices.doc('users/'+this.authservice.currentUserId + '/' + 'contacts/' + email).update(record);//'contacts' is the collection name
  }

  //delete_contact will delete the contact in firebase. (the function gets the record id)
  delete_contact(contact_uid:string, contact_email:string)
  {
    this.fireservices.doc('users/' + contact_uid + '/' + 'connected-to/' + this.authservice.currentUserName).delete();
    this.fireservices.doc('users/' + this.authservice.currentUserId + '/' + 'contacts/' + contact_email).delete();
            //this.fireservices.doc('contacts/' + recordId).delete();//-before change
  }

  delete_connection(connection_uid:string, connection_email:string)
  {

    this.fireservices.doc('users/' + connection_uid + '/' + 'contacts/' + this.authservice.currentUserName).delete();
    this.fireservices.doc('users/' + this.authservice.currentUserId + '/' + 'connected-to/' + connection_email).delete();
            //this.fireservices.doc('contacts/' + recordId).delete();//-before change
  }


  get is_owner(){
    console.log("getting is Owner", CrudService.isOwner)
    return CrudService.isOwner;
  }

  set_is_owner(val){
    CrudService.isOwner = val;
    console.log("setting is Owner", CrudService.isOwner)
  }


}
      
