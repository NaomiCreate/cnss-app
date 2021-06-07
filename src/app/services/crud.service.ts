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


  constructor(private authservice: AuthService, public fireservices:AngularFirestore,private db: AngularFireDatabase) { }
  

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
 
  
  //create_userInfo adds to the collection 'user-info', a document in firebase, that including details about the registrant 
  create_userInfo(RecordUserInfo)
  { 
    return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('user-info').doc(RecordUserInfo.email).set(RecordUserInfo);
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

  check_futureContactInContacts(email:string)
  {
    return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('contacts').doc(email).get().toPromise();
  }

  get_userInfo()
  {
    return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('user-info').snapshotChanges();  
  }

  /*This function returns user information as promise */
  get_userDetails(){
    return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('user-info').doc(this.authservice.currentUserName).get().toPromise();
  }

  get_userInfoByUid(uid)
  {
    return this.fireservices.collection('users').doc(uid).collection('user-info').snapshotChanges();  
  }

  update_user(recordId, record)
  {
    this.fireservices.doc('users/'+this.authservice.currentUserId + '/' + 'user-info/' + recordId).update(record);//'contacts' is the collection name
  }

  update_request_to_confirmed(uid:string,email:string)
  {
    console.log("update_contact_confirmed",'users/'+uid + '/' + 'contacts/' + email);
    this.fireservices.doc('users/'+uid + '/' + 'contacts/' + email).update({"confirmed": true});//'contacts' is the collection name
  }

  update_connectedTo(uid:string,emailToAdd:string,uidToAdd:string)
  {
     /*Update Record[uid] conected-to*/  
    let record = {}
    record["id"] = uidToAdd;
  
    return this.fireservices.collection('users').doc(uid).collection('connected-to').doc(emailToAdd).set(record);
  }

  update_requests(uid:string)
  {
     /*Update Record[uid] conected-to*/  
    let record = {}
    record["id"] = this.authservice.currentUserId;
  
    return this.fireservices.collection('users').doc(uid).collection('requests').doc(this.authservice.currentUserName).set(record);
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

    return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('contacts');

  }

  get_contact_details(email:string,uid:string){
    return this.fireservices.collection('users').doc(uid).collection('user-info').doc(email).get().toPromise();
  }

  get_AllConnections(uid:string)
  {
    //uid=this.authservice.currentUserId
    return this.fireservices.collection('users').doc(uid).collection('connected-to');//.snapshotChanges();
  }
  get_AllRequests(uid:string)
  {
    return this.fireservices.collection('users').doc(uid).collection('requests');//.snapshotChanges();
  }

  
  //update_contact will update the contact detailes in firebase. (the function gets the record id and the new data)
  update_contact(email,  record)
  {
    return this.fireservices.doc('users/'+this.authservice.currentUserId + '/' + 'contacts/' + email).update(record);//'contacts' is the collection name
  }


  delete_contact(uid:string, contact_email:string)
  {
    //console.log("delete_contact: ",'users/' + uid + '/' + 'contacts/' + contact_email);
    return this.fireservices.doc('users/' + uid + '/' + 'contacts/' + contact_email).delete();
          
  }
  delete_connection(uid:string, connection_email:string)
  {
    this.fireservices.doc('users/' + uid + '/' + 'connected-to/' + connection_email).delete();    
  }
  delete_request(uid:string, request_email:string)
  {
    console.log("delete_request: ",'users/' + uid + '/' + 'requests/' +request_email);
    this.fireservices.doc('users/' + uid + '/' + 'requests/' +request_email).delete();
  }

  getHistoryPermission(connection_uid:string){

    let path = `users/${connection_uid}/contacts/${this.authservice.currentUserName}`
    return this.fireservices.doc(path).get().toPromise()
    
  }

  get_uidFromDeviceID(device_id:string)
  {
    return this.fireservices.collection('deviceToUid').doc(device_id).get().toPromise();
  }
  

}
      
