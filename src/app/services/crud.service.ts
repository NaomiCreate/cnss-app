import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(public fireservices:AngularFirestore) { }
  //create_NewContact adds to the 'contacts' collection in firebase, the contact that the user entered as input
  create_NewContact(Record)
  {  
    return this.fireservices.collection('contacts').add(Record);
  }

  //get_AllContacts gets the 'contacts' collection from firebase
  get_AllContacts()
  {
    return this.fireservices.collection('contacts').snapshotChanges();
  }

  //update_contact will update the contact detailes in firebase. (the function gets the record id and the new data)
  update_contact(recordId, record)
  {
    this.fireservices.doc('contacts/' + recordId).update(record);//'contacts' is the collection name
  }
  //delete_contact will delete the contact in firebase. (the function gets the record id)
  delete_contact(recordId)
  {
    this.fireservices.doc('contacts/' + recordId).delete();
  }
}
