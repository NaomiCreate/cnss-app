import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

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
  
  subscription: Subscription;

  constructor(private authservice: AuthService,public crudservice:CrudService) { }
  // constructor() { }

  ngOnInit() {
    if(this.authservice.currentUser != null)//We will make sure the user is logged in
    {
      this.subscription = this.crudservice.get_AllConnections().subscribe(data => {
        this.connections = data.map(c => {

          let connection={};
          this.crudservice.get_contact_details(c.payload.doc.id, Object.keys(c.payload.doc.data())[0])
          .then((doc) => { 
           
            connection['phone'] = doc.data()['phone'];
            connection['firstName'] = doc.data()['firstName'];
            connection['lastName'] = doc.data()['lastName'];
            connection['email'] = doc.data()['email'];
            
          }).catch(error => {console.log(error)});
          return connection;
        })
      });  
    }
  }

 //will fire after the user press "Delete Contact"
 DeleteConnection(email:string){
  if(confirm("are you sure you want to delete this connection?")){
      if(this.authservice.currentUser != null)//We will make sure the user is logged in
      {
        this.crudservice.get_uidFromEmail(email)
            .then((doc) => {
              if(doc.exists){
                this.crudservice.delete_connection(doc.data()[email], email);
              }
          }).catch(error => {console.log(error)});
      }
    }
  }

  ngOnDestroy(){

    if(this.subscription != undefined)
        this.subscription.unsubscribe();
  }


  
}
