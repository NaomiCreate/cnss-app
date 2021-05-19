import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { promise } from 'selenium-webdriver';

enum Status {
  StandBy,
  Accept,
  // Deny
}

interface Contact{
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  shareHistory: boolean;//describes whether the system owner wants the new contact to see his alert history or not
  inEdit: boolean;
  confirmed: boolean;

}

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})

export class ContactListComponent implements OnInit {
  MAX_CONTACTS_AND_CONNECTIONS =20;
  Status = Status;
  state:Status = Status.StandBy

  contacts = [] ;//type contacts
  new_contact: Contact = {
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    shareHistory: false,
    inEdit: false,
    confirmed: false

  }

  messageNewContact = '';
  errorMessageNewContact = ''; //validation error handle
  
  messageEditContact = '';
  errorMessageEditContact = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle

  subscription: Subscription;

  constructor(private router: Router, private authservice: AuthService,public crudservice:CrudService) { }
  
  ngOnInit() {
    //this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.state=Status.StandBy;
    if(this.authservice.currentUser) //make sure the user is logged in
    {      
      this.subscription = this.crudservice.get_AllContacts().subscribe(res => {
        this.contacts = res.map(c=> {

            let contact = {
                      firstName: c.payload.doc.data()['firstName'],
                      lastName: c.payload.doc.data()['lastName'],
                      email: c.payload.doc.data()['email'],
                      shareHistory: c.payload.doc.data()['shareHistory'],
                      inEdit: false,
                      confirmed: c.payload.doc.data()['confirmed'] 
 
            }
            this.crudservice.get_contact_details(contact['email'],c.payload.doc.data()['uid'])
            .then((doc) => { 
              contact['phone'] = doc.data()['phone'];
              // this.state=Status.Accept;
              
            }).catch(error => {console.log(error)});
           return contact;  
        })
        this.state=Status.Accept;

      });
    }
  }

  addContact(futureContactEmail:string){
    //Contact will be added if: (Number of contacts of X<20) && (Number of (contacted to of Y + requests of Y)<20))
    this.checkPossibilityToAddContact()
      .then((res)=>{
        if(res){
          this.checkPossibilityToAddRequest(futureContactEmail)
            .then((res)=>{
              if(res){
                this.state=Status.StandBy;
                this.createContactRequest();
                this.state=Status.Accept;
              }
            });
        }
        else{
          this.cleanMessages();
          this.errorMessageNewContact ="You have the maximum number of contacts+requests.";
        }
      })
    }

  checkPossibilityToAddContact():Promise<boolean>
  {
    return new Promise((resolve)=>{
      //check: The user X has less than 20 contacs
      this.crudservice.get_AllContacts().subscribe(data => {
        resolve(data.length<this.MAX_CONTACTS_AND_CONNECTIONS);   
      });
    })
    
  }

  checkPossibilityToAddRequest(futureContactEmail:string):Promise<boolean>
  {
    return new Promise((resolve)=>{
      let connectionsNum =0;//The connections number of the future contact
      let requestsNum =0;//The requests number of the future contact

      //check:Y has less than 20 (contacted to + requests)
      this.crudservice.get_uidFromEmail(futureContactEmail)
      .then((doc) => {
        if (!doc.exists) {
          this.cleanMessages();
          this.errorMessageNewContact ="The requested email address does not exist in the system";
          resolve(false);
        }
        else{
          let futureContactUid = doc.data()[this.new_contact.contactEmail];
            this.crudservice.get_AllRequests(futureContactUid).get().toPromise().then((r) => {
              this.crudservice.get_AllConnections(futureContactUid).get().toPromise().then((c) => {
                if(r.size + c.size >=this.MAX_CONTACTS_AND_CONNECTIONS){
                  this.cleanMessages();
                  this.errorMessageNewContact ="The person you want to add has the maximum number of connections+requests. Contact this person.";
                  resolve(false);
                }
                else{
                  resolve(true);
                }
              });
            });
        } 
      }).catch((error) => {
        resolve(false);
      }); 
    })
  }

  createContactRequest(){
    //add "Id:[X's uid]" To Users->[Y's uid]->of Y->[X's mail]
    //add "confirmed: false" To users->[X's uid]->contacts->[Y's mail]
    let Record = {};
    Record['firstName'] = this.new_contact.contactFirstName;
    Record['lastName'] = this.new_contact.contactLastName;
    Record['email'] = this.new_contact.contactEmail;
    Record['shareHistory'] = this.new_contact.shareHistory;
    Record['uid'] = "";
    Record['confirmed'] = false;
    if(this.validateForm()){
      this.crudservice.get_uidFromEmail(this.new_contact.contactEmail)
      .then((doc) => {
        if(confirm("Are you sure you want to add this contact?")){
          this.state=Status.StandBy;
          Record['uid'] = doc.data()[this.new_contact.contactEmail]; //The phone number will come from the user-info by uid
          this.crudservice.update_requests(Record['uid'])
            .then(() => {
              this.cleanMessages();
              this.messageNewContact = "New contact Request added succesfully"
            }).catch(error=> {
              console.log(error);
            })

          //create_NewContact is defined in crud.service.ts file
            this.crudservice.create_NewContact(Record).then(res => {
            this.new_contact.contactFirstName = "";
            this.new_contact.contactLastName = "";
            this.new_contact.contactEmail = "";
            //this.messageNewContact = "New contact added successfully(still in request)";
          }).catch(error => {
            console.log(error);
          })
          console.log(this.new_contact);
        }
        
      }).catch((error) => {
        console.log("Error getting document:", error);
      }); 
    }
  }

  //will fire after the user press "Edit Contant"
  editRecord(Record)
  {
    this.messageEditContact ='';    
    Record.inEdit = true;
    Record.editFirstName= Record.firstName;
    Record.editLastName= Record.lastName;
    Record.editShareHistory = Record.shareHistory;
  }

  //will fire after the user press "Edit Contant" and than press "Update"
  updateRecord(recordData)
  {

    let record = {};
    record['firstName'] = recordData.editFirstName;
    record['lastName'] = recordData.editLastName;
    record['shareHistory'] = recordData.editShareHistory;
    if(recordData.editFirstName.length === 0)
    {
      this.cleanMessages();
      this.errorMessageEditContact = "Please enter the edited first name of the contact";
      return;
    }
    else if(recordData.editLastName.length === 0)
    {
      this.cleanMessages();
      this.errorMessageEditContact = "Please enter the edited last name of the contact";
      return;
    }
    else{
      if(confirm("Are you sure you want to edit this contact details?"))
      {
        this.state=Status.StandBy;
        this.cleanMessages();
        this.crudservice.update_contact(recordData['email'],record);
        this.messageEditContact = "Contact’s details updated successfully"
        recordData.inEdit = false;
        this.state=Status.Accept;
      }
    }
  }


//will fire after the user press "Delete Contact"
  DeleteContact(email:string){
    if(confirm("Are you sure you want to delete this contact?"))
    {
      this.state=Status.StandBy;
      if(this.authservice.currentUser != null)//We will make sure the user is logged in
      {
        this.crudservice.get_uidFromEmail(email)
          .then((doc) => {
            if(doc.exists){
                this.crudservice.delete_contact(this.authservice.currentUserId, email);
                this.crudservice.delete_connection(doc.data()[email],this.authservice.currentUserName);
            }
          }).catch(error => {console.log(error)});
      }
      this.state=Status.Accept;
    }
    this.cleanMessages();
    this.messageEditContact = 'Contact deleted successfully';
  }

  DeleteRequest(email:string){
    if(confirm("Are you sure you want to cancle this Request?"))
    {
      this.state=Status.StandBy;
      if(this.authservice.currentUser != null)//We will make sure the user is logged in
      {
        this.crudservice.get_uidFromEmail(email)
          .then((doc) => {
            if(doc.exists){
              //delete the request from the list of requests on Y
              this.crudservice.delete_request(doc.data()[email],this.authservice.currentUserName);
              //delete Y from the contacts on X
              this.crudservice.delete_contact(this.authservice.currentUserId,email);

            }
          }).catch(error => {console.log(error)});
      }
      this.state=Status.Accept;
    }
    this.cleanMessages();
    this.messageEditContact = 'The request deleted successfully';
  }

  validateForm()
  {
    if(this.new_contact.contactFirstName.length === 0)
    {
      this.errorMessageNewContact = "Please enter the first name of the person you would like to add";
      return false
    }
    if(this.new_contact.contactLastName.length === 0)
    {
      this.errorMessageNewContact = "Please enter the last name of the person you would like to add";
      return false
    }
    if(this.new_contact.contactEmail.length === 0)
    {
      this.errorMessageNewContact = "Please enter the email address of the person you would like to add";
      return false
    }
    if(this.new_contact.contactEmail == this.authservice.currentUserName)
    {
      console.log("same email");
      this.errorMessageNewContact = "Your email cannot be added to your contacts email list";
      return false
    }
    this.errorMessageNewContact = '';
    return true;
  }

  cleanMessages(){
    this.messageNewContact="";
    this.messageEditContact="";
    this.errorMessageEditContact="";
    this.errorMessageNewContact ="";
  }
  ngOnDestroy(){
    if(this.subscription != undefined)
        this.subscription.unsubscribe();
  }

}
