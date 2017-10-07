/* tslint:disable no-access-missing-member */ // TODO

import { Component, OnInit }      from '@angular/core';
import { NgForm }                 from '@angular/forms';
import { Router }                 from '@angular/router';
import { FormControl }            from '@angular/forms';

import * as moment                from 'moment';
import { SlimLoadingBarService }  from 'ng2-slim-loading-bar';
import { Observable }             from 'rxjs/Observable';

import { AppState }               from '../app.service';
import { Attendance }             from '../api/model/attendance';
import { Appointment }            from '../api/model/appointment';
import { AppointmentService }     from '../api/api/appointment.service';
import { Examination }            from '../api/model/examination';
import { ExaminationService }     from '../api/api/examination.service';
import { Patient }                from '../api/model/patient';
import { PatientService }         from '../api/api/patient.service';
import { Room }                   from '../api/model/room';
import { RoomService }            from '../api/api/room.service';

@Component({
  templateUrl: './walk-in-check-in.component.html',
  styleUrls: [ './walk-in-check-in.component.scss' ]
})

export class WalkInCheckInComponent implements OnInit {

  // Duration input
  public durationControl = new FormControl();

  // Examinations autocomplete/tag field
  public examinations: Examination[] = [];

  // Patient autocomplete field
  public patientControl = new FormControl();

  // View model for form
  public model: AppointmentViewModel = {
    id: undefined,
    title: undefined,
    description:
      localStorage.getItem('locale').startsWith('de') ? 'Akutpatient' : 'Walk-in patient',
    date: moment().format('l'),
    time: moment().format('LT'),
    duration: '30M',
    room: undefined,
    patient: undefined,
    examinations: undefined
  };

  public rooms: Room[] = undefined;
  public filteredPatients: Observable<Patient[]>;

  private filteredExaminations: Examination[] = undefined;
  private patients: Patient[] = [];

  constructor(
    private _state: AppState,
    private router: Router,
    private slimLoadingBarService: SlimLoadingBarService,
    private appointmentService: AppointmentService,
    private examinationService: ExaminationService,
    private roomService: RoomService,
    private patientService: PatientService
  ) {}

  public ngOnInit(): void {
    // Mouseflow integration
    if ((window as any)._mfq) {
      (window as any)._mfq.push(['newPageView', '/appointment/walk-in-check-in']);
    }

    // This is a sub-page
    this._state.isSubPage.next(true);
    this._state.title.next(
      localStorage.getItem('locale').startsWith('de') ?
        'Akutpatienten anmelden' :
        'Walk-In Patient Check-In'
      );
    this._state.actions.next();
    this._state.primaryAction.next();

    this.getAllRooms();

    // Set up patient autocomplete control
    this.patientService.patientFind().subscribe(
      (patients) => {
        this.patients = patients;
        this.filteredPatients = this.patientControl.valueChanges
         .startWith(null)
         .map((val) => this.filterPatients(val));
      },
      (err) => console.log(err)
    );

    // Set up examinations control
    this.examinationService.examinationFind().subscribe(
      (examinations) => this.examinations = examinations,
      (err) => console.log(err)
    );

    // Set up duration control
    this.durationControl.valueChanges
      .debounceTime(500)
      .distinctUntilChanged()
      .map((val) => this.sanitizeDuration(val))
      .subscribe(
        (x) => this.model.duration = x,
        (err) => console.log(err)
      );
  }

  public onSubmit(): void {
    this.slimLoadingBarService.start();
    const newAppointment: Appointment  = {
      title: this.model.title,
      description: this.model.description,
      modified: new Date(),
      created: new Date(),
      modifiedBy: 0,
      createdBy: 0,
      patientId: this.model.patient.id,
      roomId: this.model.room.id
    };
    const examinations: Examination[] = this.model.examinations;
    const startDate = moment(this.model.date, 'l');
    const startTime = moment(this.model.time, 'LT');
    const start = startDate.clone();
    start.hour(startTime.hour());
    start.minute(startTime.minute());
    const end: moment.Moment = start.clone();
    end.add(moment.duration('PT' + this.model.duration));
    newAppointment.start = start.toDate();
    newAppointment.end = end.toDate();

    // Add appointment
    this.appointmentService
    .appointmentCreate(newAppointment)
    .subscribe(
      (x) => {
        // Link examinations
        if (examinations && examinations.length > 0) {
          for (const examination of examinations) {
            this.linkExaminationWithAppointment(x, examination);
          }
        }
        // Complete check-in
        this.checkIn(x).subscribe(
          null,
          (err) => console.log(err),
          () => {
            this.slimLoadingBarService.complete();

            // Navigate back to schedule view
            this.router.navigateByUrl('appointment/attendance');
          }
        );
      },
      (e) => { console.log('onError: %o', e); },
      () => { console.log('Completed insert.'); }
    );
  }

  /**
   * Used to display patients in the suggestions drop down.
   */
  public patientDisplayFn(patient: Patient): string {
    return patient ?
      `${patient.givenName} ${patient.surname} ` +
      `(${moment(patient.dateOfBirth).format('l')})`
      : null;
  }

  /**
   * Used to display room names in the frontend.
   */
  public getRoomNameById(roomId: number): string {
    return this.getRoomById(roomId).name;
  }

  private linkExaminationWithAppointment(appointment: Appointment, examination: Examination) {
    this.appointmentService.appointmentPrototypeLinkExaminations(
      appointment.id.toString(),
      examination.id.toString())
    .subscribe(
      (x) => console.log(
        `Linked examination ${x.examinationId} with appointment ${x.appointmentId}`
      ),
      (e) => console.log(e),
      () => console.log('Completed linking examination with appointment.')
    );
  }

  private getAllRooms(): void {
    this.roomService
    .roomFind()
    .subscribe(
      (x) => {
        this.rooms = x;
        if (x && x.length > 0) { // If we got rooms, use the first as default
          this.model.room = x[0];
        }
      },
      (e) => console.log(e),
      () => console.log('Get all rooms complete.')
    );
  }

  private filterPatients(val: string): Patient[] {
    return val ? this.patients.filter(
      (patient) => new RegExp(val, 'gi').test(`${patient.surname} ${patient.givenName}`)
    ) : this.patients;
  }

  private findExaminations(event) {
    this.examinationService
    .examinationFind(`{"where": {"name": {"regexp": "${event.query}/i"}}}`)
    .subscribe(
      (x) => this.filteredExaminations = x,
      (e) => console.log(e),
      () => console.log('Completed querying for examinations.')
    );
  }

  private getRoomById(roomId: number): Room {
    return this.rooms.find(
      (room) => {
        return room.id === roomId;
      }
    );
  }

  private checkIn(appointment: any): Observable<Attendance> { // TODO Fix any ViewAppointment
    // Prepare data
    const data: Attendance = {
      checkedIn: new Date()
    };

    // TODO check if this patient is already checked in, and allow/deny
    // this operation. Maybe we want to allow this, but in that case, we
    // would have to set checkedIn = underTreatment = new Date().

    return this.appointmentService
      .appointmentPrototypeCreateAttendance(appointment.id.toString(), data);
  }

  /**
   * Triggered on duration input changes. Seeks to sanitize the entered value.
   */
  private sanitizeDuration(val: string) {
    if (val) {
      // Strip any whitespaces from anywhere
      val = val.replace(/\s/g, '');
      // Check different types of input
      if (/^[0-9]$/.test(val)) {
        val = val + 'H';
      } else if (/^[0-9]{2}$/.test(val)) {
        val = val + 'M';
      } else {
        val = val.toUpperCase();
      }
      // this.onFormChange(); // TODO
    }
    return val;
  }

  private humanizeDuration(durationString: string): string {
    return moment.duration('PT' + durationString).humanize();
  }
}

interface AppointmentViewModel {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  room: Room;
  patient: Patient;
  examinations: Examination[];
}
