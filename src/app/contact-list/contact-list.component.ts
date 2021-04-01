import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

interface Contact{
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})

export class ContactListComponent implements OnInit {
  contacts= [] ;//CHANGE FROM CONTACT TO CONTACTS

  contactName: string;
  contactEmail: string;
  contactPhone: string;

  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle

  subscription: Subscription;

  constructor(private router: Router, private authservice: AuthService,public crudservice:CrudService) { }
  
  ngOnInit() {

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    if(this.authservice.currentUser != null) //make sure the user is logged in
    {      
      this.subscription = this.crudservice.get_AllContacts().subscribe(res => {
        this.contacts = res.map(c=> {

            let contact = {
                      name: c.payload.doc.data()['name'],
                      email: c.payload.doc.data()['email'],                      
            }
            this.crudservice.get_contact_details(contact['email'],c.payload.doc.data()['uid'])
            .then((doc) => { 
              contact['phone']= doc.data()['phone'];
            }).catch(error => {console.log(error)});
           return contact;  
        })
      });
    }
  }

  /*CreateRecord() will fire after the user press the "Create Contact" btn*/
  CreateRecord()
  {
    if(confirm("a new contact is going be be created"))
    {
    if(this.validateForm(this.contactEmail, this.contactName, this.contactPhone)==true)
      {
        //The function stores within the relevant fields in "Record" variable, the user's input
        let Record = {};
        Record['name'] = this.contactName;
        Record['email'] = this.contactEmail;
        Record['uid'] = "";
        // Record['phone'] = this.contactPhone;


        this.crudservice.get_uidFromEmail(this.contactEmail)
        .then((doc) => {
          if (doc.exists) {

            Record['uid'] = doc.data()[this.contactEmail]; //The phone number will come from the user-info by uid
            this.crudservice.update_connectedTo(Record['uid'])
            .then(() => {
              this.message = "Contact updated succesfully"
            }).catch(error=> {
              console.log(error);
            })

            //create_NewContact is defined in crud.service.ts file
            this.crudservice.create_NewContact(Record).then(res => {
              this.contactName = "";
              this.contactEmail = "";
              this.contactPhone = "";
              this.message = "New contact added";
            }).catch(error => {
              console.log(error);
            })
          

          } else {
              // doc.data() will be undefined in this case
              alert("The user's email does not exist in the system!");
          }
        }).catch((error) => {
          console.log("Error getting document:", error);
        });  
      }  
    }
  }

  //will fire after the user press "Edit Contant"
  editRecord(Record)
  {
      Record.isEdit = true; //Following this determination, we will see on the screen what appears in html under the tag #elseBlock
      Record.editName= Record.name;
      //Record.editEmail = Record.email;//We omitted cause it doesnt make sense to edit it
     //Record.editPhone= Record.phone;//We omitted cause it doesnt make sense to edit it
  }

  //will fire after the user press "Edit Contant" and than press "Update"
  updateRecord(recordData)
  {
    if(confirm("are you sure you want to edit this contact?"))
    {
    //if(this.validateForm(recordData.email, recordData.name, recordData.phone)==true)
    //{
      let record = {};
      record['name'] = recordData.editName;
      //record['uid'] = recordData.id;
      //record['email'] = recordData.editEmail;
      //record['email'] = recordData.editEmail;//We omitted cause it doesnt make sense to edit it
      //record['phone'] = recordData.editPhone;//We omitted cause it doesnt make sense to edit it
      this.crudservice.update_contact(recordData['email'],record);//we defined update_contact() in crud.service.ts
      recordData.isEdit = false;
      this.message = "The update was successful"
    //}
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
  }

  validateForm(email, name, phone)
  {
    //check email filed:
    if(email.length === 0)
    {
      this.errorMessage = "please enter email id";
      return false
    }
    //checking if the user's email does not exist in the system-> redundant, the test is done in CreateRecord()
    /*
    if(this.crudservice.get_uidFromEmail(email) == undefined)
    {
      this.errorMessage = "The email is not in the system";
      return false
    }
    */
    if(name.length === 0)
    {
      this.errorMessage = "please enter your name";
      return false
    }
    if(phone.length != 10)
    {
      this.errorMessage = "phone number is not valid";
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
