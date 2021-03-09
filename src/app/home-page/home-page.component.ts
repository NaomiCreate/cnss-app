import { Component, OnInit } from '@angular/core';
import {CrudService} from '../services/crud.service';
import { AuthService } from '../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  user: any;
  userName: string;
  // userEmail: string;
  // userPhone: string;
  constructor(public authservice: AuthService, private router: Router,public crudservice:CrudService) { }

  ngOnInit(){
    if(this.authservice.currentUser != null)//We will make sure the user is logged in
    {
      this.crudservice.get_userInfo().subscribe(data => {
        this.user = data.map(c => {
          return {
            id: c.payload.doc.id,
            name: c.payload.doc.data()['name'],
            // userEmail: c.payload.doc.data()['email'],
            // userPhone: c.payload.doc.data()['phone'],
            // is_device_owner: c.payload.doc.data()['is-user-own-cnss'],
          };
        })
      });  
    }
  }

}
