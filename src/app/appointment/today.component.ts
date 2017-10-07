import { Component, OnInit }      from '@angular/core';
import { ViewChild }              from '@angular/core';
import { Router }                 from '@angular/router';

import * as moment                from 'moment';
import { SlimLoadingBarService }  from 'ng2-slim-loading-bar';

import { AppState }               from '../app.service';
import { Appointment }            from '../api/model/appointment';
import { ViewAppointmentService } from './appointment.service';

@Component({
  templateUrl: './today.component.html',
  styleUrls: [ './today.component.scss' ]
})

export class AppointmentTodayComponent implements OnInit {

  public appointments: Appointment[];
  public locale: string;
  public defaultView: string = 'basicDay';

  constructor(
    private _state: AppState,
    private router: Router,
    private slimLoadingBarService: SlimLoadingBarService,
    private viewAppointmentService: ViewAppointmentService
  ) {}

  public ngOnInit() {
    // Mouseflow integration
    if ((window as any)._mfq) {
      (window as any)._mfq.push(['newPageView', '/appointment/today']);
    }
    // Set up page
    this._state.isSubPage.next(false);
    this._state.title.next(
      localStorage.getItem('locale').startsWith('de') ? 'Heute' : 'Today');
    this._state.actions.next();
    this._state.primaryAction.next({
      icon: 'add',
      routerLink: 'appointment/add'
    });

    // Retrieve data
    this.getTodaysAppointments();

    // Set up calendar view
    this.locale = localStorage.getItem('locale').startsWith('de') ? 'de' : 'en';
  }

  /**
   * Triggered when a calendar event is clicked.
   */
  public handleEventClick(event) {
    this.router.navigate(['appointment', event.calEvent.id]);
  }

  private getTodaysAppointments(): void {
    this.slimLoadingBarService.start();
    const start = moment.utc().startOf('day');
    const end = moment.utc().endOf('day');
    this.viewAppointmentService
    .appointmentFind(`{"where": {"start":  {"between": ["${start.format()}", "${end.format()}"]}}}`)
    .subscribe(
      (x) => this.appointments = x,
      (e) => console.log(e),
      () => {
        console.log('Get today\'s appointments complete');
        this.slimLoadingBarService.complete();
      }
    );
  }
}
