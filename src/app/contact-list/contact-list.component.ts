import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface Contact{
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  inEdit:boolean;
}

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})

export class ContactListComponent implements OnInit {

  contacts = [] ;//type contacts
  new_contact: Contact = {
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    inEdit: false
  }

  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle

  subscription: Subscription;

  constructor(private router: Router, private authservice: AuthService,public crudservice:CrudService) { }
  
  ngOnInit() {

    //this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    if(this.authservice.currentUser != null) //make sure the user is logged in
    {      
      this.subscription = this.crudservice.get_AllContacts().subscribe(res => {
        this.contacts = res.map(c=> {

            let contact = {
                      firstName: c.payload.doc.data()['firstName'],
                      lastName: c.payload.doc.data()['lastName'],
                      email: c.payload.doc.data()['email'],
                      inEdit: false                    
            }

            this.crudservice.get_contact_details(contact['email'],c.payload.doc.data()['uid'])
            .then((doc) => { 
              contact['phone'] = doc.data()['phone'];
              
            }).catch(error => {console.log(error)});
          
           return contact;  
        })
      });
    }
  }

  /*CreateRecord() will fire after the user clicks "Create Contact" btn*/
  CreateRecord()
  {
    this.message = '';

    if(this.validateForm())
    {
      // if(confirm("a new contact is going be created"))
      // {
        //The function stores within the relevant fields in "Record" variable, the user's input
        let Record = {};
        Record['firstName'] = this.new_contact.contactFirstName;
        Record['lastName'] = this.new_contact.contactLastName;
        Record['email'] = this.new_contact.contactEmail;
        Record['uid'] = "";

        this.crudservice.get_uidFromEmail(this.new_contact.contactEmail)
        .then((doc) => {

          if (!doc.exists) {
            alert("The user's email does not exist in the system!");
          }
          else{

            if(confirm("a new contact is going be created")){

                Record['uid'] = doc.data()[this.new_contact.contactEmail]; //The phone number will come from the user-info by uid
                this.crudservice.update_connectedTo(Record['uid'])
                .then(() => {
                  this.message = "Contact updated succesfully"
                }).catch(error=> {
                  console.log(error);
                })

              //create_NewContact is defined in crud.service.ts file
                this.crudservice.create_NewContact(Record).then(res => {
                this.new_contact.contactFirstName = "";
                this.new_contact.contactLastName = "";
                this.new_contact.contactEmail = "";
                this.message = "New contact added";
              }).catch(error => {
                console.log(error);
              })
            }
          }
          
        }).catch((error) => {
          console.log("Error getting document:", error);
        });  
       
    }
  }

  //will fire after the user press "Edit Contant"
  editRecord(Record)
  {
    this.message ='';    
    Record.inEdit = true;
    Record.editFirstName= Record.firstName;
    Record.editLastName= Record.lastName;
  }

  //will fire after the user press "Edit Contant" and than press "Update"
  updateRecord(recordData)
  {
    if(confirm("are you sure you want to edit this contact?"))
    {
      let record = {};
      record['firstName'] = recordData.editFirstName;
      record['lastName'] = recordData.editLastName;
    

      this.crudservice.update_contact(recordData['email'],record);
      this.message = "The update was successful"
      recordData.inEdit = false;
    }
  }


//will fire after the user press "Delete Contact"
  DeleteContact(email:string){
    if(confirm("are you sure you want to delete this contact?"))
    {
      if(this.authservice.currentUser != null)//We will make sure the user is logged in
      {
        this.crudservice.get_uidFromEmail(email)
          .then((doc) => {
            if(doc.exists){
                this.crudservice.delete_contact(doc.data()[email],email);
            }
          }).catch(error => {console.log(error)});
      }
    }

    this.errorMessage = '';
    this.message = 'Contact removed succesfully';
  }

  validateForm()
  {
    //this.message = '';//only one message at a time, clear message to allow errorMessage.

    if(this.new_contact.contactFirstName.length === 0)
    {
      this.errorMessage = "Please enter contacts first name";
      return false
    }
    // if(this.new_contact.contactLastName.length === 0)
    // {
    //   this.errorMessage = "Please enter contacts last name";
    //   return false
    // }
    if(this.new_contact.contactEmail.length === 0)
    {
      this.errorMessage = "Please enter email";
      return false
    }
  
    this.errorMessage = '';
    return true;
  }

  ngOnDestroy(){

    if(this.subscription != undefined)
        this.subscription.unsubscribe();
  }

  
}
