import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {Subscription } from 'rxjs';


enum Status {
  StandBy,
  Accept,
  Deny
}

interface Contact{
  firstName: string;
  lastName: string;
  email: string;
  shareHistory: boolean; 
  inEdit: boolean;
  confirmed: boolean;
  phone?:number; // when entering new contact details a phone number is not required
}

const MAX_CONTACTS_AND_CONNECTIONS = 3; //20;

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})


export class ContactListComponent implements OnInit {

  public state = Status; 
  public contacts_state:Status = Status.StandBy; // contacts state
  contacts: Array<Contact> = []

  new_contact: Contact = {
    firstName: '',
    lastName: '',
    email: '',
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

    this.cleanMessages();
    this.set_contacts(); // need to call this function any time contact list is updated
    
  }

  get_phone(email:string, uid:string):Promise<number>{

    console.log("get_phone");
      return new Promise(resolve =>
        this.crudservice.get_contact_details(email, uid)
        .then(res => resolve(res.data()['phone']))
        .catch(err => console.log(err))
      )

  }



  set_contacts(){

    this.subscription = this.crudservice.get_AllContacts().valueChanges()
      .subscribe(res => {

      this.contacts_state = Status.StandBy; // stand by while loading connections

      console.log("get_AllContacts");

      if(res.length == 0){
        this.contacts_state = Status.Deny;
        this.contacts = [];
        return;
      }

      this.contacts = res.map(c => {

        let contact:Contact = {
            firstName: c['firstName'],
            lastName: c['lastName'],
            email: c['email'],
            shareHistory: c['shareHistory'], 
            inEdit: false,
            confirmed: c['confirmed'],
            // phone is loaded later
        }
        
        this.get_phone(c['email'], c['uid']).then(phone_num => {contact['phone'] = phone_num});
        return contact;
      })
    
      this.contacts_state = Status.Accept
      
    
    })
    

  }




  //X want to add Y
  addContact(futureContactEmail:string){

    this.cleanMessages();

    if(this.validateForm()){

      //if((Number of contacts of X<20) && (Number of (contacted to of Y + requests of Y)<20))
      this.checkPossibilityToAddContact()
        .then((res)=>{
          if(res){
            this.checkPossibilityToAddRequest(futureContactEmail)
              .then((res)=>{
                if(res){
                  this.createContactRequest()
                }
              });
          }
          else{
            this.errorMessageNewContact ="You reached the maximum amount of contacts/requests";
          }
        })
    }

  }

  checkPossibilityToAddContact():Promise<boolean>
  {
    return new Promise((resolve)=>{
      //check: The user X has less than 20 contacs
      this.crudservice.get_AllContacts().get().toPromise()
      .then(data => {
        resolve(data.size < MAX_CONTACTS_AND_CONNECTIONS);   
      });
    })
    
  }

  checkPossibilityToAddRequest(futureContactEmail:string):Promise<boolean>
  {
    return new Promise((resolve)=>{

      //check:Y has less than 20 (contacted to + requests)
      this.crudservice.get_uidFromEmail(futureContactEmail)
      .then((doc) => {
        if (!doc.exists) {
          this.cleanMessages();
          this.errorMessageNewContact ="The requested email address does not exist in the system";
          resolve(false);
        }
        else{
          let futureContactUid = doc.data()[this.new_contact.email];
            this.crudservice.get_AllRequests(futureContactUid).get().toPromise().then((r) => {
              this.crudservice.get_AllConnections(futureContactUid).get().toPromise().then((c) => {
                if(r.size + c.size >= MAX_CONTACTS_AND_CONNECTIONS){
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

  createContactRequest():Promise<boolean>{
    
      //add "Id:[X's uid]" To Users->[Y's uid]->of Y->[X's mail]
      //add "confirmed: false" To users->[X's uid]->contacts->[Y's mail]
      let Record = {
          firstName:this.new_contact.firstName,
          lastName:this.new_contact.lastName,
          email:this.new_contact.email,
          shareHistory:this.new_contact.shareHistory,
          uid:"",
          confirmed:false
      }

      return new Promise((resolve)=>
        this.crudservice.get_uidFromEmail(this.new_contact.email)
        .then((doc) => {
      
              Record['uid'] = doc.data()[this.new_contact.email]; 

              this.crudservice.update_requests(Record['uid'])
              .then(() => {
                this.messageNewContact = "New contact Request added succesfully"


                 //create_NewContact is defined in crud.service.ts file
                this.crudservice.create_NewContact(Record)
                .then(res => {
                  this.new_contact.firstName = "";
                  this.new_contact.lastName = "";
                  this.new_contact.email = "";
                  resolve(true); //resove because this is where we add the new contact to the contact list
          
                }).catch(error => {
                  console.log(error);
                })
              }).catch(error=> {
                console.log(error);
              })

      }).catch((error) => {
        console.log("Error getting document:", error);
      })
    ) 
  }

  //will fire after the user press "Edit Contant"
  editRecord(Record)
  {
    this.cleanMessages();
    this.messageEditContact ='';    
    Record.inEdit = true;
    Record.editFirstName = Record.firstName;
    Record.editLastName = Record.lastName;
    Record.editShareHistory = Record.shareHistory;
  }

  //will fire after the user press "Edit Contant" and than press "Update"
  updateRecord(recordData)
  {

    this.cleanMessages();
    let record = {};
    record['firstName'] = recordData.editFirstName;
    record['lastName'] = recordData.editLastName;
    record['shareHistory'] = recordData.editShareHistory;
    if(recordData.editFirstName.length === 0)
    {
      this.errorMessageEditContact = "Please enter the edited first name of the contact";
      return;
    }
    else if(recordData.editLastName.length === 0)
    {
      this.errorMessageEditContact = "Please enter the edited last name of the contact";
      return;
    }
    else{
        this.errorMessageEditContact="";
        this.crudservice.update_contact(recordData['email'],record);
        this.messageEditContact = "Contact’s details updated successfully"
        recordData.inEdit = false;
    }
  }

//will fire after the user press "Delete Contact"
  DeleteContact(email:string){
    this.cleanMessages();
    if(confirm("Are you sure you want to delete this contact?"))
    {
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
    
    }
    this.messageEditContact = 'Contact deleted successfully';
  }

  DeleteRequest(email:string){
    this.cleanMessages();
    if(confirm("Are you sure you want to cancle this Request?"))
    {
        this.crudservice.get_uidFromEmail(email)
          .then((doc) => {
            if(doc.exists){
              //delete the request from the list of requests on Y
              this.crudservice.delete_request(doc.data()[email],this.authservice.currentUserName);
              //delete Y from the contacts on X
              this.crudservice.delete_contact(this.authservice.currentUserId,email)//.then(()=> this.set_contacts());
        
            }
          }).catch(error => {console.log(error)});
    }
    this.messageEditContact = 'The request deleted successfully';
  }

  validateForm()
  {
    this.cleanMessages();
    if(this.new_contact.firstName.length === 0)
    {
      this.errorMessageNewContact = "Please enter the first name of the person you would like to add";
      return false
    }
    if(this.new_contact.lastName.length === 0)
    {
      this.errorMessageNewContact = "Please enter the last name of the person you would like to add";
      return false
    }
    if(this.new_contact.email.length === 0)
    {
      this.errorMessageNewContact = "Please enter the email address of the person you would like to add";
      return false
    }
    if(this.new_contact.email == this.authservice.currentUserName)
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
