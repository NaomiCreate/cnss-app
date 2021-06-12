import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
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


  constructor(public authservice: AuthService, public crudservice:CrudService, private db: AngularFireDatabase, private ownerguard: OwnerGuard) { }
  

  ngOnInit(): void {

    //check if the user owns CNSS system
    this.checkIfOwner().then((result) => {

      if(result){
        this.crudservice.get_userInfo().subscribe(data => {

          this.deviceId = data[0].payload.doc.data()['device_id'];//Get user device id
          console.log("Debug::user.deviceId", this.deviceId)

          this.dbPath = `/devices/${this.deviceId}`; //the path to the State attribute in the real-time database
          console.log("Debug::this.dbPath", this.dbPath)
          
          this.checkState();//show current switch state on the screen
        })
      }

    })
   
  }

  checkState(){

    this.db.database.ref(this.dbPath+"/control").on('value',(snap)=>{
      if(snap.val() == null || snap.val() == undefined)
      {
        //create path and defined it as off
        this.db.list(this.dbPath).update('control',{state: 'off' });
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

  checkIfOwner():Promise<boolean>
  {
     return new Promise((resolve) => 
      this.crudservice.get_userDetails()
      .then(doc => {
        resolve(doc.data()['is_device_owner']);
      }))
  }
}
