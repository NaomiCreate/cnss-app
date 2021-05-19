import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

enum Status {
  StandBy,
  Accept,
  // Deny
}

@Component({
  selector: 'app-connected-to',
  templateUrl: './connected-to.component.html',
  styleUrls: ['./connected-to.component.css']
})
export class ConnectedToComponent implements OnInit {

  Status = Status;
  state:Status = Status.StandBy

  connections = [];
  requests = [];

  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle
  
  subscription: Subscription;

  constructor(private authservice: AuthService,public crudservice:CrudService) { }

  ngOnInit() {
    if(this.authservice.currentUser != null)//We will make sure the user is logged in
    {
      // Show connections (requests that confirmed)
      this.subscription = this.crudservice.get_AllConnections(this.authservice.currentUserId).snapshotChanges().subscribe(data => {
        this.connections = data.map(c => {
          let connection={};
          this.crudservice.get_contact_details(c.payload.doc.id, c.payload.doc.data()['id'])
          .then((doc) => { 
            connection['phone'] = doc.data()['phone'];
            connection['firstName'] = doc.data()['firstName'];
            connection['lastName'] = doc.data()['lastName'];
            //connection['shareHistory'] = doc.data()['shareHistory'];
            connection['email'] = doc.data()['email'];
            //this.state=Status.Accept;
          }).catch(error => {console.log(error)});
          return connection;
        })
        this.state=Status.Accept;
      });  
      // Show requests (requests that didn't confirmed and didn't rejected)
      this.subscription = this.crudservice.get_AllRequests(this.authservice.currentUserId).snapshotChanges().subscribe(data => {
        this.requests = data.map(c => {
          let request={};

          this.crudservice.get_contact_details(c.payload.doc.id, c.payload.doc.data()['id'])
          .then((doc) => { 
           
            request['phone'] = doc.data()['phone'];
            request['firstName'] = doc.data()['firstName'];
            request['lastName'] = doc.data()['lastName'];
            //connection['shareHistory'] = doc.data()['shareHistory'];
            request['email'] = doc.data()['email'];

            // this.state=Status.Accept;
          
          }).catch(error => {console.log(error)});
          return request;
        })
        this.state=Status.Accept;

      }); 
    }
  }

  //will fire after the user press "Delete Contact"
  DeleteConnection(email:string){
    if(confirm("Are you sure you want to delete this connection?")){
      this.state=Status.StandBy;
      if(this.authservice.currentUser != null)//We will make sure the user is logged in
      {
        this.crudservice.get_uidFromEmail(email)
            .then((doc) => {
              if(doc.exists){
                this.crudservice.delete_contact(doc.data()[email], this.authservice.currentUserName)
                this.crudservice.delete_connection(this.authservice.currentUserId, email);
              }
              this.state=Status.Accept;
          }).catch(error => {console.log(error)});
      }
    }
  }

  rejectRequest(emailRequestToReject:string){
    //Delete Request from Users->[Y's uid]->requestes
    //Delete Contact from Users->[X's uid]->contacts
    if(confirm("Are you sure you want to reject this request?")){
      this.state=Status.StandBy;
      //Delete Request
      this.crudservice.delete_request(this.authservice.currentUserId, emailRequestToReject);
      //Delete Contact
      this.crudservice.get_uidFromEmail(emailRequestToReject)
        .then((doc) => {
          if(doc.exists){
            this.crudservice.delete_contact(doc.data()[emailRequestToReject], this.authservice.currentUserName);
          }
          this.state=Status.Accept;
      }).catch(error => {console.log(error)});
    }
  }
  
  confirmRequest(emailToConfirm:string){
    if(confirm("Are you sure you want to confirm this request?")){
      this.state=Status.StandBy;
      this.crudservice.get_uidFromEmail(emailToConfirm)
        .then((doc) => {
          if(doc.exists){
            //tranfer the request to connected to.
            this.crudservice.update_connectedTo(this.authservice.currentUserId,emailToConfirm,doc.data()[emailToConfirm]);
            //delete from requests
            this.crudservice.delete_request(this.authservice.currentUserId, emailToConfirm)
            //udate contacts to be: confirmed: true
            this.crudservice.update_request_to_confirmed(doc.data()[emailToConfirm],this.authservice.currentUserName);
          }
          this.state=Status.Accept;
      }).catch(error => {console.log(error)});
    }
  }

  ngOnDestroy(){
    if(this.subscription != undefined)
        this.subscription.unsubscribe();
  }

}
