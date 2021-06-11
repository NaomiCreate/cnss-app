import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CrudService } from '../services/crud.service';

@Injectable({
  providedIn: 'root'
})
export class ManagerGuard implements CanActivate {

  constructor(public crudservice : CrudService, public authService: AuthService, public router: Router){}
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    
      return new Promise((resolve)=>{
        this.authService.auth.onAuthStateChanged((user) => {
          if (user) {
            this.authService.set_user(user);
            resolve( this.crudservice.get_userDetails()
                      .then(doc => {
                      if (!doc.data()['is_device_owner']){
                        alert("This page is accessible to device owners only");
                      }
                      return doc.data()['is_device_owner'];
                    }));
          } else {
            resolve(false);
          }
        })
      });
  }
  
}
