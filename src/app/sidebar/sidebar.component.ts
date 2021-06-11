import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';//So the sidebar appears after the user registered
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {CrudService} from '../services/crud.service';
import { AuthGuard } from '../guards/auth.guard';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit{
  isSidebarOpen:boolean = false; //will hold the sidebar state 

  // is_device_owner:any;
  // dbData:any;

  constructor(public authservice: AuthService, public router: Router, public crudservice:CrudService) { }

  toggleSideBar()
  { 
    if(this.isSidebarOpen==true)   
      this.isSidebarOpen = false; 
    else // this.isSidebarOpen==false
      this.isSidebarOpen = true; 

  }
  ngOnInit(): void {}

  ngOnDestroy(){}

}
