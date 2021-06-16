import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

enum Status {
  StandBy,
  Accept,
  Deny
}

interface Connection{
  firstName: string;
  lastName: string;
  email: string;
  phone:number; 
}

@Component({
  selector: 'app-connected-to',
  templateUrl: './connected-to.component.html',
  styleUrls: ['./connected-to.component.css']
})
export class ConnectedToComponent implements OnInit {

  public state = Status; 
  public connections_state:Status = Status.StandBy; // connections state

  requests:Array<Connection>;
  connections:Array<Connection>;

  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle
  
  subscriptions:Array<Subscription> = [];

  constructor(private authservice: AuthService,public crudservice:CrudService) { }

  ngOnInit() {

    // Show connections (requests that confirmed)
    this.subscriptions.push(this.crudservice.get_AllConnections(this.authservice.currentUserId).snapshotChanges()
    .subscribe(data => {

      this.connections_state=Status.StandBy;

      this.connections = data.map(c => {

          let connection:Connection = {
            firstName: '',
            lastName: '',
            email: '',
            phone: 0,
          };

          this.crudservice.get_contact_details(c.payload.doc.id, c.payload.doc.data()['id'])
          .then((doc) => { 
            connection.phone = doc.data()['phone'];
            connection.firstName = doc.data()['firstName'];
            connection.lastName = doc.data()['lastName'];
            connection.email = doc.data()['email'];
            
          }).catch(error => {console.log(error)});
          return connection;
        })

        // Show requests (requests that didn't confirmed and didn't rejected)
        this.subscriptions.push(this.crudservice.get_AllRequests(this.authservice.currentUserId).snapshotChanges()
        .subscribe(data => {

            this.connections_state=Status.StandBy;

            this.requests = data.map(c => {

              let request:Connection = {
                firstName: '',
                lastName: '',
                email: '',
                phone: 0,
              };

              this.crudservice.get_contact_details(c.payload.doc.id, c.payload.doc.data()['id'])
              .then((doc) => { 
                
                request['phone'] = doc.data()['phone'];
                request['firstName'] = doc.data()['firstName'];
                request['lastName'] = doc.data()['lastName'];
                request['email'] = doc.data()['email'];
              
              }).catch(error => {console.log(error)});
              return request;
            })
            
            if(this.connections.length + this.requests.length > 0){
              this.connections_state=Status.Accept;
            }else{
              this.connections_state=Status.Deny;
            }
            
          })
        )
      }) 
    );

    
    
  }

  //will fire after the user press "Delete Contact"
  DeleteConnection(email:string){
    if(confirm("Are you sure you want to delete this connection?")){
      if(this.authservice.currentUser != null)//We will make sure the user is logged in
      {
        this.crudservice.get_uidFromEmail(email)
            .then((doc) => {
              if(doc.exists){
                this.crudservice.delete_contact(doc.data()[email], this.authservice.currentUserName)
                this.crudservice.delete_connection(this.authservice.currentUserId, email);
              }
          }).catch(error => {console.log(error)});
      }
    }
  }

  rejectRequest(emailRequestToReject:string){
    //Delete Request from Users->[Y's uid]->requestes
    //Delete Contact from Users->[X's uid]->contacts
    if(confirm("Are you sure you want to reject this request?")){
      //Delete Request
      this.crudservice.delete_request(this.authservice.currentUserId, emailRequestToReject);
      //Delete Contact
      this.crudservice.get_uidFromEmail(emailRequestToReject)
        .then((doc) => {
          if(doc.exists){
            this.crudservice.delete_contact(doc.data()[emailRequestToReject], this.authservice.currentUserName);
          }
      }).catch(error => {console.log(error)});
    }
  }
  
  confirmRequest(emailToConfirm:string){
    
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
    }).catch(error => {console.log(error)});
    
  }

  ngOnDestroy(){
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

}
