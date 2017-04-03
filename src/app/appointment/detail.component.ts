/* tslint:disable no-access-missing-member */ // TODO

import { Component, QueryList }    from '@angular/core';
import { ViewChildren, ViewChild } from '@angular/core';
import { OnInit }                  from '@angular/core';
import { MdInputDirective }        from '@angular/material';
import { NgForm }                  from '@angular/forms';
import { FormControl }             from '@angular/forms';
import { ActivatedRoute, Router }  from '@angular/router';

import { AutoComplete }            from 'primeng/primeng';
import { Observable }              from 'rxjs';
import { SlimLoadingBarService }   from 'ng2-slim-loading-bar';
import * as moment                 from 'moment';
import * as humanizeDuration       from 'humanize-duration';

import { AppState }                from '../app.service';
import { Appointment }             from '../api/model/appointment';
import { AppointmentService }      from '../api/api/appointment.service';
import { Examination }             from '../api/model/examination';
import { ExaminationService }      from '../api/api/examination.service';
import { Patient }                 from '../api/model/patient';
import { PatientService }          from '../api/api/patient.service';
import { Room }                    from '../api/model/room';
import { RoomService }             from '../api/api/room.service';
import { NotificationService }     from '../api/api/notification.service';
import { NotificationBuilder }     from './notificationBuilder';

@Component({
  templateUrl: './detail.component.html',
  styleUrls: [ './detail.component.scss' ]
})

export class AppointmentDetailComponent implements OnInit {

  public editing: boolean = false;
  public rooms: Room[] = undefined;

  // Patient autocomplete field
  public patientControl = new FormControl();

  // Duration input
  public durationControl = new FormControl();

  // Examinations autocomplete/tag field
  private examinations: Examination[] = [];

  private patients: Patient[] = [];
  private filteredPatients: Observable<Patient[]>;
  private filteredExaminations: Examination[] = undefined;
  private proposedTimeSlots: any[] = [];
  private localeHumanizer: any;
  private isTwelveHours: boolean;
  @ViewChildren('examMultiChooser') private examsMultiInput: QueryList<AutoComplete>;
  @ViewChild('duration') private durationInput: MdInputDirective;
  private model: AppointmentViewModel = {
    id: undefined,
    title: undefined,
    description: undefined,
    date: undefined,
    time: undefined,
    duration: undefined,
    room: undefined,
    patient: undefined,
    examinations: undefined,
    reminders: undefined
  };

  constructor(
    private _state: AppState,
    private route: ActivatedRoute,
    private router: Router,
    private slimLoadingBarService: SlimLoadingBarService,
    private appointmentService: AppointmentService,
    private examinationService: ExaminationService,
    private roomService: RoomService,
    private patientService: PatientService,
    private notificationService: NotificationService) {}

  public ngOnInit(): void {
    let param: string = this.route.snapshot.params['id'];

    // Mouseflow integration
    if ((<any> window)._mfq) {
      (<any> window)._mfq.push(['newPageView', '/appointment/' + param]);
    }

    // This is a sub-page
    this._state.isSubPage.next(true);
    this._state.title.next();
    this._state.actions.next();
    this._state.primaryAction.next();

    // Set up localized humanizer for durations
    this.localeHumanizer = humanizeDuration.humanizer({
      language: localStorage.getItem('locale').startsWith('de') ? 'de' : 'en'
    });

    // Set up localization
    this.isTwelveHours = this.isCurrentLocaleUsingTwelveHours();

    // Set up rooms control (retrieve all rooms)
    this.getAllRooms();

    // Create new appointment
    if (param === 'add') {
      this.editing = true;

    // View or edit existing appointment
    } else if (!isNaN(Number(param))) {
      this.editing = false;
      console.log('displaying appointment with id: %d', Number(param));
      this.getAppointmentById(Number(param));
    }

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
        (x) => {
          this.model.duration = x;
          this.onFormChange();
        },
        (err) => console.log(err)
      );
  }

  public onSubmit(): void {
    this.slimLoadingBarService.start();
    let newAppointment: Appointment  = {
      title: this.model.title,
      description: this.model.description,
      modified: new Date(),
      created: new Date(),
      modifiedBy: 0,
      createdBy: 0,
      patientId: this.model.patient.id,
      roomId: this.model.room.id
    };
    let examinations: Examination[] = this.model.examinations;
    let startDate = moment(this.model.date, 'l');
    let startTime = moment(this.model.time, 'LT');
    let start = startDate.clone();
    start.hour(startTime.hour());
    start.minute(startTime.minute());
    let end: moment.Moment = start.clone();
    end.add(moment.duration('PT' + this.model.duration));
    newAppointment.start = start.toDate();
    newAppointment.end = end.toDate();

    // Add...
    if (!this.model.id) {
      this.appointmentService
      .appointmentCreate(newAppointment)
      .subscribe(
        (x) => {

          // Link examinations
          if (examinations && examinations.length > 0) {
            for (let examination of examinations) {
              this.linkExaminationWithAppointment(x, examination);
            }
          }

          // Create reminders
          if (this.model.reminders) {
            this.notificationService.notificationCreate(
              NotificationBuilder.getNotification(
                x,
                this.model.emailReminder ? this.model.patient.email : undefined,
                this.model.smsReminder ? this.model.patient.phone : undefined
              ))
            .subscribe(
              null,
              (err) => console.log(err),
              () => console.log('Created notification.')
            );
          }

        },
        (e) => { console.log('onError: %o', e); },
        () => {
          this.slimLoadingBarService.complete();
          console.log('Completed insert.');

          // Navigate back to schedule view
          this.router.navigateByUrl('appointment');
        }
      );

    // ...or update
    } else {
      this.appointmentService
      .appointmentPrototypePatchAttributes(this.model.id.toString(), newAppointment)
      .subscribe(
        (x) => {
          // Before linking examinations, we actually have to get rid of existing ones
          this.appointmentService.appointmentPrototypeDeleteExaminations(String(x.id))
          .subscribe(
            null,
            null,
            () => {
              for (let examination of examinations) {
                this.linkExaminationWithAppointment(x, examination);
              }
            }
          );

          // TODO Reminders currently being ignored on update
        },
        (e) => { console.log('onError: %o', e); },
        () => {
          this.slimLoadingBarService.complete();
          console.log('Completed update.');

          // Navigate back to schedule view
          this.router.navigateByUrl('appointment');
        }
      );
    }
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

  private getRoomById(roomId: number): Room {
    return this.rooms.find(
      (room) => {
        return room.id === roomId;
      }
    );
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
      (x) => this.rooms = x,
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

  /**
   * Queries the appointment service for a possible time slot for the given
   * duration and room, from the given start date onwards.
   *
   * @param examinationId Will be ignored.
   */
  private findTime(
    duration?: string,
    examinationId?: number,
    roomId?: number,
    startDate?: moment.Moment
  ) {
    console.log('Querying for the next free time slot.');
    this.appointmentService
    .appointmentFindTime(
      duration ? 'PT' + duration : 'PT40M', // TODO move to server and replace by config-default
      examinationId,
      roomId,
      startDate ? startDate.toDate() : undefined)
    .subscribe(
      (x) => {
        this.proposedTimeSlots.push(x);
        this.proposedTimeSlots.sort(this.compareSuggestedTimeSlots);
      },
      (e) => console.log(e),
      () => console.log('Completed querying for the next free time slot.')
    );
  }

  /**
   * Helper method used to sort the suggested time slots array after inserting
   * new elements.
   */
  private compareSuggestedTimeSlots(slotA, slotB): number {
    if (!slotA.scheduledTasks.NewAppointment.schedule[0].start ||
        !slotB.scheduledTasks.NewAppointment.schedule[0].start) {
          return 1;
    }
    let a = moment(slotA.scheduledTasks.NewAppointment.schedule[0].start);
    let b = moment(slotB.scheduledTasks.NewAppointment.schedule[0].start);
    if (a.isAfter(b)) {
      return 1;
    }
    if (a.isBefore(b)) {
      return -1;
    }
    return 0;
  }

  /**
   * Will be called everytime the form changes, and query the backend for new
   * time slot suggestions.
   */
  private onFormChange() {
    // When editing an existing appointment, don't display suggestions
    if (this.model.id) {
      return;
    }

    // Every time the form changes, use latest information to find a suitable date
    if (this.model.duration) {

      // Check if duration is valid
      let duration = moment.duration('PT' + this.model.duration);
      if (moment.isDuration(duration) && duration.asMinutes() > 1) {
        this.proposedTimeSlots = [];

        // Query for time slots from now on
        this.findTime(
          this.model.duration,
          this.model.examinations && this.model.examinations.length > 0 ?
            this.model.examinations[0].id : undefined,
          this.model.room ? this.model.room.id : undefined,
          moment()
        );
        // The next day on
        this.findTime(
          this.model.duration,
          this.model.examinations && this.model.examinations.length > 0 ?
            this.model.examinations[0].id : undefined,
          this.model.room ? this.model.room.id : undefined,
          moment().add(1, 'day')
        );
        // From next week on
        this.findTime(
          this.model.duration,
          this.model.examinations && this.model.examinations.length > 0 ?
            this.model.examinations[0].id : undefined,
          this.model.room ? this.model.room.id : undefined,
          moment().add(1, 'week')
        );
        // From one month on
        this.findTime(
          this.model.duration,
          this.model.examinations && this.model.examinations.length > 0 ?
            this.model.examinations[0].id : undefined,
          this.model.room ? this.model.room.id : undefined,
          moment().add(1, 'month')
        );
      }
    }
  }

  private getAppointmentById(id: number) {
    this.appointmentService.appointmentFindById(id.toString())
      .subscribe(
        (x) => {
          let startDate = moment(x.start);
          let endDate = moment(x.end);
          let duration = moment.duration(endDate.diff(startDate));
          this.model.id = x.id;
          this.model.date = startDate.format('l');
          this.model.time = startDate.format('LT');
          this.model.duration = duration.toJSON().substring(2);
          this.model.title = x.title;
          this.model.description = x.description;
          if (x.patientId) {
            this.patientService.patientFindById(x.patientId.toString())
              .subscribe(
                (y) => this.model.patient = y,
                (e) => console.log(e),
                () => console.log('Completed querying for patient by id')
              );
          }
          this.model.room = this.getRoomById(x.roomId);
          this.appointmentService.appointmentPrototypeGetExaminations(x.id.toString())
            .subscribe(
              (z) => this.model.examinations = z,
              (e) => console.log(e),
              () => console.log('Completed querying for examinations by appointment id')
            );
        },
        (e) => console.log(e),
        () => console.log('Completed querying for appointment data')
      );
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

  private applySuggestion(timeSlot: any) {
    if (timeSlot) {
      console.log(timeSlot);
      let startDate = moment(timeSlot.start);
      this.model.duration =
        `${moment.duration(timeSlot.duration, 'minutes').toJSON().substring(2)}`;
      this.model.date = startDate.format('l');
      this.model.time = startDate.format('LT');
      this.model.room = this.getRoomById(timeSlot.resources[0]);

      // Clear suggestions
      this.proposedTimeSlots = [];
    }
  }

  private handleEditClick() {
    this.editing = true;
  }

  private formatDuration(durationString: string): string {
    return this.localeHumanizer(moment.duration('PT' + durationString).asMilliseconds());
  }

  private isCurrentLocaleUsingTwelveHours(): boolean {
    return moment().format('LT').endsWith('M');
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
  reminders: boolean;
  smsReminder?: boolean;
  emailReminder?: boolean;
}
