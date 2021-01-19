import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any;
  // userName: string;
  // userEmail: string;
  // userPhone: string;
  message = '';
  errorMessage = ''; //validation error handle
  error: {name:string, message:string} = {name:'' , message:''}; //firebase error handle

  constructor(public authservice: AuthService, private router: Router,public crudservice:CrudService) { }
  //constructor() { }

  ngOnInit(){
    if(this.authservice.currentUser != null)//We will make sure the user is logged in
    {
      //this.isEdit= false;
      this.crudservice.get_userInfo().subscribe(data => {
        this.user = data.map(c => {
          return {
            id: c.payload.doc.id,
            isEdit: false,
            name: c.payload.doc.data()['name'],
            email: c.payload.doc.data()['email'],
            phone: c.payload.doc.data()['phone'],
            isOwningCNSS: c.payload.doc.data()['is-user-own-cnss'],
          };
        })
        console.log(this.user);
      });  
    }
  }
  //will fire after the user press "Edit Contant"
  editRecord(Record)
  {        
    Record.isEdit = true; //Following this determination, we will see on the screen what appears in html under the tag #elseBlock
    Record.editName= Record.name;
    Record.editEmail = Record.email;
    Record.editPhone = Record.phone;
    Record.editIsUserOwnCnss = Record.isOwningCNSS;
  }
  //will fire after the user press "Edit" and than press "Update"
  updateRecord(recordData)
  {
    if(confirm("are you sure you want to edit this contact?"))
    {
    //if(this.validateForm(recordData.email, recordData.name, recordData.phone)==true)
    //{
      let record = {};
      record['name'] = recordData.editName;
      record['email'] = recordData.editEmail;
      record['phone'] = recordData.editPhone;
      record['is-user-own-cnss'] = recordData.editIsUserOwnCnss;

      this.crudservice.update_user(recordData.id, record);//we defined update_contact() in crud.service.ts
      this.message = "The update was successful";
      recordData.isEdit = false;
    }
  //}
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
    // if(phone.length != 10)
    // {
    //   this.errorMessage = "phone number is not valid";
    //   return false
    // }
    this.errorMessage = '';
    return true;
  }
  //from: https://medium.com/@mertkadirgrsoy/how-to-refresh-a-page-only-once-with-javascript-cdbaf079fc73
  /* reloadPage() {
    // The last "domLoading" Time //
    var currentDocumentTimestamp =
    new Date(performance.timing.domLoading).getTime();
    // Current Time //
    var now = Date.now();
    // Ten Seconds //
    var tenSec = 10 * 1000;
    // Plus Ten Seconds //
    var plusTenSec = currentDocumentTimestamp + tenSec;
    if (now > plusTenSec) {
    location.reload();
    } else {}
    }*/
}
