import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';
import { AuthService } from '../services/auth.service';
import { snapshotChanges } from '@angular/fire/database';
//import { userInfo } from 'os';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  //constructor(public fireservices:AngularFirestore) { }
  constructor(private authservice: AuthService, public fireservices:AngularFirestore) { }
  
  //--------
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
    record[email] = this.authservice.currentUserId

    return this.fireservices.collection('emailToUid').doc(email).set(record);
  }

  get_uidFromEmail(email:string)
  {
    //return this.fireservices.collection('emailToUid').doc(email)
    return this.fireservices.collection('emailToUid').doc(email).get().toPromise()
  }

  get_userInfo()
  {
    return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('user-info').snapshotChanges();
    
  }

  //update_contact will update the contact detailes in firebase. (the function gets the record id and the new data)
  update_user(recordId, record)
  {
    this.fireservices.doc('users/'+this.authservice.currentUserId + '/' + 'user-info/' + record.email).update(record);//'contacts' is the collection name
    //this.fireservices.doc('users/'+this.authservice.currentUserId + '/' + 'user-info/' + recordId).update(record);//'contacts' is the collection name
            //this.fireservices.doc('contacts/' + recordId).update(record);//'contacts' is the collection name//-before change
  }
  //--------

  update_connectedTo(uid:string)
  {
     /*Update Record[uid] conected-to*/  
    let record = {}
    record[this.authservice.currentUserId] = true;
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
    console.log('print email:');
    console.log(email);
    console.log('print uid:');
    console.log(uid);
    return this.fireservices.collection('users').doc(uid).collection('user-info').doc(email).get().toPromise();

    // return this.fireservices.collection('users').doc(uid).collection('user-info').doc('Klo7isEJZimqZNqsuMFm').get().toPromise()  //.get().toPromise();
//    return this.fireservices.collection('users').doc(uid).collection('user-info').doc('Klo7isEJZimqZNqsuMFm').get().toPromise()  //.get().toPromise();

  }

  get_AllConnections()
  {
    return this.fireservices.collection('users').doc(this.authservice.currentUserId).collection('connected-to').snapshotChanges();
    //return this.fireservices.collection('contacts').snapshotChanges();//-before change
  }

  //update_contact will update the contact detailes in firebase. (the function gets the record id and the new data)
  update_contact(email,  record)
  {
    this.fireservices.doc('users/'+this.authservice.currentUserId + '/' + 'contacts/' + email).update(record);//'contacts' is the collection name
            //this.fireservices.doc('contacts/' + recordId).update(record);//'contacts' is the collection name//-before change
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
}
