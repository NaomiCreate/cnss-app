import { Injectable } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AngularFireDatabase} from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class RealTimeService {

  constructor(private authservice: AuthService, private db: AngularFireDatabase) { }


  read_history(){
   
  }
}
