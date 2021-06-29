import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subscription } from 'rxjs';
import { OwnerGuard } from '../guards/owner.guard';
import { AuthService } from '../services/auth.service';
import { CrudService } from '../services/crud.service';

enum Switch {
  StandBy,
  On,
  Off
}

@Component({
  selector: 'app-system-control',
  templateUrl: './system-control.component.html',
  styleUrls: ['./system-control.component.css']
})
export class SystemControlComponent implements OnInit {

  public state = Switch; // for HTML
  switch:Switch = Switch.StandBy; // for TS

  visualSwitchState: boolean;//for the [(ngModel)] in HTML

  public deviceId: string;
  public dbPath:string;
  public dbData:Subscription;


  constructor(public authservice: AuthService, public crudservice:CrudService, private db: AngularFireDatabase, private ownerguard: OwnerGuard) { }
  

  ngOnInit(): void {

    this.isOwner(); // start listener
    
  }

  isOwner(){

    this.dbData = this.crudservice.get_userInfo().subscribe(
      (result) => {
        if(result.length > 0){

          // not a device owner
          if(!result[0].payload.doc.data().is_device_owner){
            this.switch = Switch.StandBy;
          }

          // device owner
          else{
      
            this.deviceId = result[0].payload.doc.data().device_id;//result.data().device_id;
            this.dbPath = `/devices/${this.deviceId}`;
            this.checkState();
             
          }
        }
      }
    )
  }

  checkState(){

    this.db.database.ref(this.dbPath+"/control").on('value',(snap)=>{
      if(snap.val() == null || snap.val() == undefined)
      {
        this.visualSwitchState=false;
        this.switch = Switch.Off;
      }
      else
      {
        if(snap.val()['state'] == 'on')
        {
          this.visualSwitchState=true;
          this.switch = Switch.On;
        }
        else//snap.val()['state'] == 'off'
        {
          this.visualSwitchState=false;
          this.switch = Switch.Off;

        }
      }
    });
    
  }


  switchState(){

    if(this.switch == Switch.On) //If currentState==On -> turn Off
    {
      this.db.list(this.dbPath).update('control',{state: 'off' });
      this.visualSwitchState=false;
      this.switch = Switch.Off;
    }
    else if(this.switch == Switch.Off)//If currentState==Status.Off -> turn On
    {
      this.db.list(this.dbPath).update('control', {state: 'on' });
      this.visualSwitchState=true;
      this.switch = Switch.On;
    }
  }





  ngOnDestroy(){
    if(this.dbData != null){
      this.dbData.unsubscribe();
    }
  }

}
