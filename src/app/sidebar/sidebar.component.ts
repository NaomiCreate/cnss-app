import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';//So the sidebar appears after the user registered
import {Router} from '@angular/router';
import {CrudService} from '../services/crud.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  // is_device_owner:any;
  // dbData:any;

  constructor(public authservice: AuthService, public router: Router, public crudservice:CrudService) { }


  ngOnInit(): void {

    // this.crudservice.get_userInfo().subscribe(data => {
    //   this.is_device_owner = data.map(c => {
    //     console.log("c.payload.doc.data()['is_device_owner'];", c.payload.doc.data()['is_device_owner'], typeof(c.payload.doc.data()['is_device_owner']))
    //     return  c.payload.doc.data()['is_device_owner']; 
    //   })
    // })
  }

  ngOnDestroy(){

    // if(this.dbData != undefined)
    //   this.dbData.unsubscribe();

  }

}
