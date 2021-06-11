import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CrudService } from '../services/crud.service';

@Injectable({
  providedIn: 'root'
})
export class OwnerGuard implements CanActivate {

  constructor(public crudservice : CrudService, public router: Router){}


  canActivate(

    next: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {


    // return this.crudservice.get_userDetails()
    // .then(doc => {
    //   return doc.data()['is_device_owner'];
    // });

    return true;
    
  }
  
}
