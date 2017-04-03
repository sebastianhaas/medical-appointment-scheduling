import { Component, OnInit }                       from '@angular/core';
import { ViewContainerRef }                        from '@angular/core';
import { ActivatedRoute }                          from '@angular/router';
import { MdDialogRef, MdDialog, MdDialogConfig }   from '@angular/material';

import * as moment                                 from 'moment';
import * as humanizeDuration                       from 'humanize-duration';
import { SlimLoadingBarService }                   from 'ng2-slim-loading-bar';

import { AppState }                                from '../app.service';
import { Appointment }                             from '../api/model/appointment';
import { Patient }                                 from '../api/model/patient';
import { PatientService }                          from '../api/api/patient.service';
import { AppointmentService }                      from '../api/api/appointment.service';
import { ViewAppointmentService }                  from './appointment.service';
import { ViewAppointment }                         from './appointment.viewmodel';
import { PatientCancelAppointmentDialogComponent } from './patient-cancel-appointment.dialog';

@Component({
  templateUrl: './patient.component.html',
  styleUrls: [ './patient.component.scss' ]
})
export class PatientComponent implements OnInit {

  public patient: Patient;
  public appointments: ViewAppointment[];

  private dialogRef: MdDialogRef<PatientCancelAppointmentDialogComponent>;
  private localeHumanizer: any;

  constructor(
    private _state: AppState,
    private slimLoadingBarService: SlimLoadingBarService,
    private appointmentService: AppointmentService,
    private viewAppointmentService: ViewAppointmentService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private viewContainerRef: ViewContainerRef,
    private dialog: MdDialog) {}

  public ngOnInit() {
    // Mouseflow integration
    if ((<any> window)._mfq) {
      (<any> window)._mfq.push(['newPageView', '/appointment/patient']);
    }

    // Set up page
    this._state.isSubPage.next(true);
    this._state.title.next();
    this._state.actions.next();
    this._state.primaryAction.next();

    // Retrieve patient to be displayed from route and retrieve data from service
    let param: string = this.route.snapshot.params['id'];

    this.slimLoadingBarService.start();
    this.patientService.patientFindById(param)
    .subscribe(
      (patient) => {
        this.patient = patient;
        this._state.title.next(patient.givenName + ' ' + patient.surname);
        this.findAppointmentsForPatient(this.patient.id);
      },
      (err) => console.log(err)
    );

    // Set up localized humanizer for durations
    this.localeHumanizer = humanizeDuration.humanizer({
      language: localStorage.getItem('locale').startsWith('de') ? 'de' : 'en'
    });
  }

  /**
   * Opens a dialog that reassures that the appointment should be deleted.
   */
  public openCancelAppointmentDialog(appointment: Appointment) {
    let config = new MdDialogConfig();
    config.viewContainerRef = this.viewContainerRef;

    this.dialogRef = this.dialog.open(PatientCancelAppointmentDialogComponent, config);
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result === 'yes') {
        this.cancelAppointment(appointment);
      }
      this.dialogRef = null;
    });
  }

  /**
   * Used to format the duration of the appointment on in the template.
   */
  public formatDuration(appointment: Appointment): string {
    let start = moment(appointment.start);
    let end = moment(appointment.end);
    let duration = moment.duration(end.diff(start));
    return this.localeHumanizer(duration.asMilliseconds());
  }

  private cancelAppointment(appointment: Appointment) {
    this.appointmentService.appointmentDeleteById(appointment.id.toString())
    .subscribe(
      null,
      (err) => console.log(err),
      () => {
        this.appointments = undefined;
        this.findAppointmentsForPatient(this.patient.id);
      }
    );
  }

  private findAppointmentsForPatient(patientId: number) {
    let filter = {
      where: {
        patientId
      }
    };
    this.viewAppointmentService.appointmentFind(JSON.stringify(filter))
    .subscribe(
      (appointments) => this.appointments = appointments,
      (err) => console.log(err),
      () => this.slimLoadingBarService.complete()
    );
  }
}
