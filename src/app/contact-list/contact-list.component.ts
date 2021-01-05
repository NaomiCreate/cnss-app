import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent implements OnInit {
  contact: any;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle

  constructor(private authservice: AuthService,public crudservice:CrudService) { }
  
  ngOnInit() {
    if(this.authservice.currentUser != null)//We will make sure the user is logged in
    {
      this.crudservice.get_AllContacts().subscribe(data => {
        this.contact = data.map(c => {
          return {
            id: c.payload.doc.id,
            isEdit: false,
            name: c.payload.doc.data()['name'],
            email: c.payload.doc.data()['email'],
            phone: c.payload.doc.data()['phone'],
          };
        })
        console.log(this.contact);
      });  
    }
  }
  /*CreateRecord() will fire after the user press the "Create Contact" btn*/
  CreateRecord()
  {
    if(this.validateForm(this.contactEmail, this.contactName, this.contactPhone)==true)
    {
      //The function stores within the relevant fields in "Record" variable, the user's input
      let Record = {};
      Record['name'] = this.contactName;
      Record['email'] = this.contactEmail;
      Record['phone'] = this.contactPhone;
      
      //create_NewContact is defined in crud.service.ts file
      this.crudservice.create_NewContact(Record).then(res => {
        this.contactName = "";
        this.contactEmail = "";
        this.contactPhone = "";
        console.log(res);
        this.message = "New contact added";
      }).catch(error => {
        console.log(error);
      })
    }
  }

  //will fire after the user press "Edit Contant"
  editRecord(Record)
  {
      Record.isEdit = true; //Following this determination, we will see on the screen what appears in html under the tag #elseBlock
      Record.editName= Record.name;
      Record.editEmail = Record.email;
      Record.editPhone= Record.phone;
  }
  //will fire after the user press "Edit Contant" and than press "Update"
  updateRecord(recordData)
  {
    //if(this.validateForm(recordData.email, recordData.name, recordData.phone)==true)
    //{
      let record = {};
      record['name'] = recordData.editName;
      record['email'] = recordData.editEmail;
      record['phone'] = recordData.editPhone;
      this.crudservice.update_contact(recordData.id, record);//we defined update_contact() in crud.service.ts
      recordData.isEdit = false;
      this.message = "The update was successful"
    //}
    //recordData.isEdit = false;
  }

  //will fire after the user press "Delete Contact"
  DeleteContact(recordId){
    if(this.authservice.currentUser != null)//We will make sure the user is logged in
    {
      this.crudservice.delete_contact(recordId);
    }
  }

  validateForm(email, name, phone)
  {
    if(email.length === 0)
    {
      this.errorMessage = "please enter email id";
      return false
    }
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
}
