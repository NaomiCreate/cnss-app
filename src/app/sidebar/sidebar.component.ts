import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';//So the sidebar appears after the user registered
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {CrudService} from '../services/crud.service';
import { AuthGuard } from '../guards/auth.guard';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{
  isSidebarOpen:boolean = false; //will hold the sidebar state 

  is_device_owner:boolean = false;
  dbData:Subscription;

  constructor(public authservice: AuthService, public router: Router, public crudservice:CrudService) { }

  toggleSideBar()
  { 
    this.isOwner();
    if(this.isSidebarOpen==true)   
      this.isSidebarOpen = false; 
    else // this.isSidebarOpen==false
      this.isSidebarOpen = true; 
  }


  isOwner(){

    this.dbData = this.crudservice.get_userInfo().subscribe(
      (result) => {
        if(result.length > 0){
          if(result[0].payload.doc.data().is_device_owner){
            this.is_device_owner = true;
          }
          else{
            this.is_device_owner = false;
          }
        }
      }
    )
      
  }

  ngOnInit(): void {}

  looseSubscription(){
    if(this.dbData != null){
      this.dbData.unsubscribe();
    }
  }

  ngOnDestroy(){
    if(this.dbData != null){
      this.dbData.unsubscribe();
    }
  }

}
