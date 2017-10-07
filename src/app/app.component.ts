/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation }   from '@angular/core';
import { ViewContainerRef }               from '@angular/core';
import { OnInit }                         from '@angular/core';
import { Location }                       from '@angular/common';
import { MdSnackBar }                     from '@angular/material';
import { MdSnackBarRef }                  from '@angular/material';
import { SimpleSnackBar }                 from '@angular/material';
import { MdDialogRef, MdDialog }          from '@angular/material';
import { Router }                         from '@angular/router';

import { SlimLoadingBarService }          from 'ng2-slim-loading-bar';
import { Subscription }                   from 'rxjs/Subscription';

import { AppState, Action }               from './app.service';
import { ExaminationService }             from './api/api/examination.service';
import { AttendanceService }              from './api/api/attendance.service';
import { AppointmentService }             from './api/api/appointment.service';
import { PatientService }                 from './api/api/patient.service';
import { RoomService }                    from './api/api/room.service';
import { CantyCTIService,
  IncomingCallState }                     from './cantyCti.service';
import {
  InsertTestExaminationsDialogComponent } from './insert-test-examinations.dialog';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [ './app.component.scss' ],
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {

  public url = 'https://twitter.com/AngularClass';
  public primaryAction: Action;
  public isSubPage = false;
  public title = 'Medical Appointment Scheduling';
  public actions: Action[];

  private snackBarRef: MdSnackBarRef<SimpleSnackBar>;

  constructor(
    private _state: AppState,
    private _location: Location,
    private router: Router,
    private dialog: MdDialog,
    private slimLoadingBarService: SlimLoadingBarService,
    private attendanceService: AttendanceService,
    private appointmentService: AppointmentService,
    private examinationService: ExaminationService,
    private patientService: PatientService,
    private roomService: RoomService,
    private cantyCTIService: CantyCTIService,
    private snackBar: MdSnackBar,
    private viewContainerRef: ViewContainerRef) {}

  public ngOnInit() {
    console.log('Locale is %s', localStorage.getItem('locale'));

    // Listen for title changes
    this._state.title.subscribe(
      (title) => this.title = title,
      (error) => {
        this.title = 'Medical Appointment Scheduling';
        console.log('Error getting title for activated route.');
      },
      () => console.log('Finished retrieving titles for activated route.')
    );

    // Listen for toolbar icon changes
    this._state.isSubPage.subscribe(
      (isSubPage) => this.isSubPage = isSubPage,
      (error) => {
        this.isSubPage = false;
        console.log('Error getting isSubPage for activated route.');
      },
      () => console.log('Finished retrieving isSubPage for activated route.')
    );

    // Listen for toolbar action changes
    this._state.actions.subscribe(
      (actions) => this.actions = actions,
      (error) => {
        this.actions = undefined;
        console.log('Error getting actions for activated route.');
      },
      () => console.log('Finished retrieving actions for activated route.')
    );

    // Listen for toolbar action changes
    this._state.primaryAction.subscribe(
      (primaryAction) => this.primaryAction = primaryAction,
      (error) => {
        this.primaryAction = undefined;
        console.log('Error getting primary action for activated route.');
      },
      () => console.log('Finished retrieving primary action for activated route.')
    );

    // Listen for CantyCTI events
    this.cantyCTIService.incomingCall.subscribe(
      (incomingCall) => {
        if (incomingCall.callState === IncomingCallState.RINGING) {
          const filter = {
            where: {
              phone: incomingCall.phoneNumber
            }
          };
          this.patientService.patientFindOne(JSON.stringify(filter))
          .subscribe(
            (patient) => {
              const message = localStorage.getItem('locale').startsWith('de') ?
                `Eingehender Anruf von ${patient.givenName} ${patient.surname}` :
                `Incoming call from ${patient.givenName} ${patient.surname}`;
              const action = localStorage.getItem('locale')
                .startsWith('de') ? 'Zum Patienten' : 'Open';

              this.snackBarRef = this.snackBar.open(message, action);

              this.snackBarRef.onAction().subscribe(
                null,
                null,
                () => this.router.navigate(['appointment', 'patient', patient.id])
              );
            },
            (err) => {
              this.snackBar.open(
                `Incoming call from ${incomingCall.phoneNumber}`,
                'OK'
              );
            }
          );
        } else if (incomingCall.callState === IncomingCallState.OFFHOOK) {
          // Nothing to do here, just keep displaying the snack bar
        } else { // Hang up, IDLE
          this.snackBarRef.dismiss(); // No probleme here if already dismissed
          this.snackBarRef = null;
        }
      },
      (err) => console.log(err),
      () => console.log('CantyCTI has finished broadcasting incoming calls.')
    );
  }

  public actionsHandler(action: Action) {
    if (action) {
      if (action.clickHandler) {
        action.clickHandler();
      }
    }
  }

  public navigateBack() {
    this._location.back();
  }

  public deleteAllRooms() {
    this.slimLoadingBarService.start();
    this.roomService.roomDeleteAllRooms()
    .subscribe(
      (x) => {
        this.snackBar.open(`Deleted ${x.deletedCount} rooms.`, null, {
          duration: 3000
        });
        console.log(`Deleted all ${x.deletedCount} rooms.`);
        this.slimLoadingBarService.complete();
      },
      (err) => {
        console.log(err);
        this.slimLoadingBarService.reset();
      }
    );
  }

  public deleteAllAppointments() {
    this.slimLoadingBarService.start();
    this.appointmentService.appointmentDeleteAllAppointments()
    .subscribe(
      (x) => {
        this.snackBar.open(`Deleted ${x.deletedCount} appointments.`, null, {
          duration: 3000
        });
        console.log(`Deleted all ${x.deletedCount} appointments.`);
        this.slimLoadingBarService.complete();
      },
      (err) => {
        console.log(err);
        this.slimLoadingBarService.reset();
      }
    );
  }

  public deleteAllExaminations() {
    this.slimLoadingBarService.start();
    this.examinationService.examinationDeleteAllExaminations()
    .subscribe(
      (x) => {
        this.snackBar.open(`Deleted ${x.deletedCount} examinations.`, null, {
          duration: 3000
        });
        console.log(`Deleted all ${x.deletedCount} examinations.`);
        this.slimLoadingBarService.complete();
      },
      (err) => {
        console.log(err);
        this.slimLoadingBarService.reset();
      }
    );
  }

  public deleteAllAttendances() {
    this.slimLoadingBarService.start();
    this.attendanceService.attendanceDeleteAllAttendances()
    .subscribe(
      (x) => {
        this.snackBar.open(`Deleted ${x.deletedCount} attendances.`, null, {
          duration: 3000
        });
        console.log(`Deleted all ${x.deletedCount} attendances.`);
        this.slimLoadingBarService.complete();
      },
      (err) => {
        console.log(err);
        this.slimLoadingBarService.reset();
      }
    );
  }

  public deleteAllPatients() {
    this.slimLoadingBarService.start();
    this.patientService.patientDeleteAllPatients()
    .subscribe(
      (x) => {
        this.snackBar.open(`Deleted ${x.deletedCount} patients.`, null, {
          duration: 3000
        });
        console.log(`Deleted all ${x.deletedCount} patients.`);
        this.slimLoadingBarService.complete();
      },
      (err) => {
        console.log(err);
        this.slimLoadingBarService.reset();
      }
    );
  }

  public insertTestPatients() {
    this.slimLoadingBarService.start();
    this.patientService.patientInsertTestData(localStorage.getItem('locale'))
    .subscribe(
      (x) => {
        this.snackBar.open(`Inserted ${x.insertCount} test entries for patients.`, null, {
          duration: 3000
        });
        console.log(`Inserted ${x.insertCount} test entries for patients.`);
        this.slimLoadingBarService.complete();
      },
      (err) => {
        console.log(err);
        this.slimLoadingBarService.reset();
      }
    );
  }

  public insertTestExaminations() {
    this.dialog.open(InsertTestExaminationsDialogComponent).afterClosed().subscribe(
      (result) => {
        if (result) {
          this.slimLoadingBarService.start();
          this.examinationService.examinationInsertTestData(
            result.sectionNumber,
            localStorage.getItem('locale')
          )
          .subscribe(
            (x) => {
              this.snackBar.open(
                `Inserted ${x.insertCount} examinations from ${result.sectionTitle}.`,
                null,
                { duration: 3000 }
              );
              console.log(`Inserted ${x.insertCount} examinations from ${result.sectionTitle}.`);
              this.slimLoadingBarService.complete();
            },
            (err) => {
              console.log(err);
              this.slimLoadingBarService.reset();
            }
          );
        }
      }
    );
  }

  public insertTestRooms() {
    this.slimLoadingBarService.start();
    this.roomService.roomInsertTestData(localStorage.getItem('locale'))
    .subscribe(
      (x) => {
        this.snackBar.open(`Inserted ${x.insertCount} test entries for rooms.`, null, {
          duration: 3000
        });
        console.log(`Inserted ${x.insertCount} test entries for rooms.`);
        this.slimLoadingBarService.complete();
      },
      (err) => {
        console.log(err);
        this.slimLoadingBarService.reset();
      }
    );
  }

  public createRandomAppointments() {
    this.slimLoadingBarService.start();
    this.appointmentService.appointmentGenerateRandomAppointments()
    .subscribe(
      (x) => {
        this.snackBar.open('Created random appointments.', null, {
          duration: 3000
        });
        console.log('Created random appointments.');
        this.slimLoadingBarService.complete();
      },
      (err) => {
        console.log(err);
        this.slimLoadingBarService.reset();
      }
    );
  }

  public createRandomAttendances() {
    this.slimLoadingBarService.start();
    this.attendanceService.attendanceGenerateRandomAttendances()
    .subscribe(
      (x) => {
        this.snackBar.open('Created random attendances.', null, {
          duration: 3000
        });
        console.log('Created random attendances.');
        this.slimLoadingBarService.complete();
      },
      (err) => {
        console.log(err);
        this.slimLoadingBarService.reset();
      }
    );
  }
}
