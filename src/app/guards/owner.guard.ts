import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CrudService } from '../services/crud.service';

@Injectable({
  providedIn: 'root'
})
export class OwnerGuard implements CanActivate {

  constructor(public crudService : CrudService, public router: Router){}


  canActivate(

    next: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // alert("ownrship guard")
    // this.crudService.get_ownership()
    // .then(()=>{alert("is owner")})
    // .catch(()=>{
    //   alert("this page are acceble to device owners only");
    //   this.router.navigate(['/profile']);
    // });
    // return true;



    

    if(!this.crudService.is_owner){
        alert("this page are acceble to device owners only");
        this.router.navigate(['/profile']);
    }

    return true;
  }
  
}
