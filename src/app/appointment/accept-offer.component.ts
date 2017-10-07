import { Component, OnInit }      from '@angular/core';
import { ActivatedRoute }         from '@angular/router';

import * as moment                from 'moment';
import { SlimLoadingBarService }  from 'ng2-slim-loading-bar';

import { AppState }               from '../app.service';
import { Appointment }            from '../api/model/appointment';
import { AppointmentService }     from '../api/api/appointment.service';

@Component({
  templateUrl: './accept-offer.component.html',
  styleUrls: [ './accept-offer.component.scss' ]
})
export class AcceptOfferComponent implements OnInit {

  public acceptedAppointment: Appointment;
  public failed: boolean;

  constructor(
    private _state: AppState,
    private route: ActivatedRoute,
    private slimLoadingBarService: SlimLoadingBarService,
    private appointmentService: AppointmentService
  ) {}

  public ngOnInit() {
    // Mouseflow integration
    if ((window as any)._mfq) {
      (window as any)._mfq.push(['newPageView', '/appointment/accept']);
    }

    // Set up page
    this._state.isSubPage.next(true); // TODO block this #114
    this._state.title.next(
      localStorage.getItem('locale').startsWith('de') ? 'Terminbestätigung' : 'Accept Appointment');
    this._state.actions.next();
    this._state.primaryAction.next();

    // Retrieve data
    this.slimLoadingBarService.start();
    this.appointmentService.appointmentAcceptOffer(this.route.snapshot.params['secret'])
    .subscribe(
      (appointment) => this.acceptedAppointment = appointment,
      (err) => {
        console.log(err);
        if (err._body.error.status === 404 && err._body.error.code === 'NOT_FOUND_OR_EXPIRED') {
          this.failed = true;
        } else {
          console.log(err);
        }
      },
      () => {
        this.slimLoadingBarService.complete();
        console.log('Accepted offer successfully.');
      }
    );
  }

  /**
   * Used to format a moment locale specific in the template.
   */
  public formatMoment(date: Date) {
    return moment(date).format('LLLL');
  }
}
