import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-connected-to',
  templateUrl: './connected-to.component.html',
  styleUrls: ['./connected-to.component.css']
})
export class ConnectedToComponent implements OnInit {
  connections = [];
  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle

  constructor(private authservice: AuthService,public crudservice:CrudService) { }
  // constructor() { }

  ngOnInit() {
    if(this.authservice.currentUser != null)//We will make sure the user is logged in
    {
      this.crudservice.get_AllConnections().subscribe(data => {
        this.connections = data.map(c => {
          //console.log('c.payload.doc.id');
         // console.log(c.payload.doc.id);
          //console.log('Object');
          //console.log(Object.keys(c.payload.doc.data())[0]);
          let connection={};

          this.crudservice.get_contact_details(c.payload.doc.id, Object.keys(c.payload.doc.data())[0])
          .then((doc) => { 
            connection = {
              phone: doc.data()['phone'],
              name: doc.data()['name'],
              email: doc.data()['email']
            } 
            console.log(connection);
            return connection;
            //this.connections.push(connection);
          }).catch(error => {console.log(error)});
          //console.log('connection');
          //console.log(connection);
                 //return connection;
          // return {
          //   name: Object.keys(c.payload.doc)[0],

          //   //name: c.payload.doc,
          //   //name: c.payload.doc.data()['name'],
          //   email: c.payload.doc.id,//in Firestore, the id of the doc is the mail
          //   //phone: c.payload.doc.data()['phone'],
          //   //phone: this.crudservice.get_contact_phone(email:string,uid:string)
          // };
        })
        console.log(this.connections);
      });  
    }
  }
 //will fire after the user press "Delete Contact"
 DeleteConnection(recordId){
  if(confirm("are you sure you want to delete this connection?"))
  {
    if(this.authservice.currentUser != null)//We will make sure the user is logged in
    {
      this.crudservice.delete_connection(recordId);
    }
  }
}
}
