import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-connected-to',
  templateUrl: './connected-to.component.html',
  styleUrls: ['./connected-to.component.css']
})
export class ConnectedToComponent implements OnInit {
  connection: any;
  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle

  constructor(private authservice: AuthService,public crudservice:CrudService) { }
  // constructor() { }

  ngOnInit() {
    if(this.authservice.currentUser != null)//We will make sure the user is logged in
    {
      this.crudservice.get_AllConnections().subscribe(data => {
        this.connection = data.map(c => {
          return {
            id: c.payload.doc.id,
            name: c.payload.doc.data()['name'],
            email: c.payload.doc.data()['email'],
            phone: c.payload.doc.data()['phone'],
          };
        })
        console.log(this.connection);
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
