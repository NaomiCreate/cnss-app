import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import {AngularFirestore} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  constructor(public fireservices:AngularFirestore) { }

  create_NewContact(Record)
  {  
    return this.fireservices.collection('contacts').add(Record);
  }
}
