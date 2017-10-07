import { Component, OnInit }      from '@angular/core';
import { ViewChild }              from '@angular/core';

import * as moment                from 'moment';
import { Schedule }               from 'primeng/primeng';
import { SlimLoadingBarService }  from 'ng2-slim-loading-bar';

import { AppState, Action }       from '../app.service';
import { ViewAppointment }        from './appointment.viewmodel';
import { Appointment }            from '../api/model/appointment';
import { ViewAppointmentService } from './appointment.service';
import { PatientService }         from '../api/api/patient.service';

@Component({
  templateUrl: './anon.component.html',
  styleUrls: [ './anon.component.scss' ]
})

export class AnonComponent implements OnInit {

  public appointments: ViewAppointment[];
  public locale: string;
  public hiddenDays: number[] = [ 0 ]; // Hide Sundays by default
  public viewDate: moment.Moment = moment();
  public minTime: moment.Duration = moment.duration('07:00:00');
  public maxTime: moment.Duration = moment.duration('20:00:00');
  public viewMode: string = 'basicWeek';
  public refreshCalendar: boolean = false; // Tiny hack to get fullcalendar to refresh

  @ViewChild(Schedule) private schedule: Schedule;

  constructor(
    private _state: AppState,
    private slimLoadingBarService: SlimLoadingBarService,
    private viewAppointmentService: ViewAppointmentService,
    private patientService: PatientService
  ) {}

  public ngOnInit() {
    // Mouseflow integration
    if ((window as any)._mfq) {
      (window as any)._mfq.push(['newPageView', '/appointment/anon']);
    }

    // Set up page
    this._state.isSubPage.next(false); // TODO block menu, this should be a dead-end
    this._state.title.next(this.getTitleFromViewDate());
    this._state.actions.next(this.getActions('agendaWeek'));
    this._state.primaryAction.next();

    // Retrieve data
    this.getAllAppointments();

    // Set up calendar view
    this.locale = localStorage.getItem('locale').startsWith('de') ? 'de' : 'en';
  }

  private getAllAppointments(): void {
    this.slimLoadingBarService.start();
    this.viewAppointmentService
    .appointmentFindAnonymous()
    .subscribe(
      (x) => this.appointments = x,
      (e) => console.log(e),
      () => {
        console.log('Get all appointments complete');
        this.slimLoadingBarService.complete();
      }
    );
  }

  private handleNextClick() {
    this.viewDate = this.viewDate.add(1, 'week');
    this._state.title.next(this.getTitleFromViewDate());
    this.schedule.gotoDate(this.viewDate);
  }

  private handleTodayClick() {
    this.viewDate = moment();
    this._state.title.next(this.getTitleFromViewDate());
    this.schedule.gotoDate(this.viewDate);
  }

  private handlePrevClick() {
    this.viewDate = this.viewDate.subtract(1, 'week');
    this._state.title.next(this.getTitleFromViewDate());
    this.schedule.gotoDate(this.viewDate);
  }

  private handleViewModeChange(viewMode: string) {
    this.refreshCalendar = true;
    this.viewMode = viewMode;
    setTimeout(() => this.refreshCalendar = false, 0);
    this._state.actions.next(
      this.getActions(viewMode === 'agendaWeek' ? 'basicWeek' : 'agendaWeek')
    );
  }

  private getTitleFromViewDate() {
    const startString = this.viewDate.format('MMMM Do');
    let endString;
    const endOfWeekMoment = this.viewDate.clone().add(6, 'days');
    // Check if this week spreads over two months
    if (this.viewDate.month() === endOfWeekMoment.month()) {
      endString = endOfWeekMoment.format('Do YYYY');
    } else {
      endString = endOfWeekMoment.format('MMMM Do YYYY');
    }
    const weekString = this.viewDate.format(
      localStorage.getItem('locale').startsWith('de') ? '[Woche] w' : '[Week] w');
    return startString + ' - ' + endString + ', ' + weekString;
  }

  private getActions(nextViewMode: string): Action[] {
    return [
      {
        icon: nextViewMode === 'basicWeek' ? 'list' : 'schedule',
        clickHandler: this.handleViewModeChange.bind(this, nextViewMode)
      },
      {
        icon: 'keyboard_arrow_left',
        clickHandler: this.handlePrevClick.bind(this)
      },
      {
        icon: 'today',
        clickHandler: this.handleTodayClick.bind(this)
      },
      {
        icon: 'keyboard_arrow_right',
        clickHandler: this.handleNextClick.bind(this)
      }
    ];
  }
}
