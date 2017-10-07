import { Component, OnInit }      from '@angular/core';

import * as moment                from 'moment';
import * as async                 from 'async';
import { SlimLoadingBarService }  from 'ng2-slim-loading-bar';

import { AppState }               from '../app.service';
import { Attendance }             from '../api/model/attendance';
import { AppointmentService }     from '../api/api/appointment.service';
import { AttendanceService }      from '../api/api/attendance.service';

declare var Plotly: any;

@Component({
  templateUrl: './statistics.component.html',
  styleUrls: [ './statistics.component.scss' ]
})
export class StatisticsComponent implements OnInit {

  public noData: boolean;
  private colors: string[] = [
    '#00bcd4', '#4caf50', '#cddc39', '#ff9800', '#e91e63', '#673ab7', '#9c27b0'
  ];

  constructor(
    private _state: AppState,
    private slimLoadingBarService: SlimLoadingBarService,
    private attendanceService: AttendanceService,
    private appointmentService: AppointmentService
  ) {}

  public ngOnInit() {
    // Mouseflow integration
    if ((window as any)._mfq) {
      (window as any)._mfq.push(['newPageView', '/appointment/statistics']);
    }
    this._state.isSubPage.next(false);
    this._state.title.next(
      localStorage.getItem('locale').startsWith('de') ? 'Statistik' : 'Statistics');
    this._state.actions.next();
    this._state.primaryAction.next();

    // Retrieve data for statistics
    this.slimLoadingBarService.start();
    this.attendanceService.attendanceFind()
    .subscribe(
      (attendances) => {
        if (attendances.length <= 0) {
          this.noData = true;
          return;
        }

        const data: number[][] = [];

        async.each(attendances, (attendance: Attendance, callback: (err) => void) => {
          this.appointmentService.appointmentFindById(attendance.appointmentId.toString())
          .subscribe(
            (appointment) => {
              // Calculate actual offset from planned time in minutes for box plot
              let offset = moment.duration(moment(attendance.underTreatment)
                .diff(moment(appointment.start)))
                .asMinutes();
              offset = Math.round( offset * 10 ) / 10; // Round for better readability in box plot

              const dayOfWeek = moment(appointment.start).isoWeekday();
              if (!data[dayOfWeek]) {
                data[dayOfWeek] = [];
              }
              data[dayOfWeek].push(offset);
            },
            (err) => callback(err),
            () => callback(null)
          );
        }, (err) => {
          if ( err ) {
            console.log(err);
          } else {
            this.plot(data);
          }
        });
      },
      (error) => console.log(error)
    );
  }

  private plot(data: number[][]) {
    const plotData: PlotlyTrace[] = [];
    for (let i = 0; i < data.length; i++) {
      plotData.push({
        y: data[i],
        name: moment().isoWeekday(i).format('dddd'),
        boxpoints: 'suspectedoutliers',
        marker: {
          color: this.colors[i],
          outliercolor: 'rgba(219, 64, 82, 0.6)',
          line: {
            outliercolor: 'rgba(219, 64, 82, 1.0)',
            outlierwidth: 2
          }
        },
        type: 'box'
      });
    }
    const layout = {
      yaxis: {
        title: localStorage.getItem('locale').startsWith('de') ? 'Minuten' : 'Minutes',
        zeroline: false,
        gridcolor: 'rgba(0, 0, 0, 0.1)'
      },
      boxmode: 'group',
      showlegend: false
    };

    Plotly.newPlot('boxplot', plotData, layout, {displayModeBar: false});
    this.slimLoadingBarService.complete();
  }
}

declare interface PlotlyTrace {
  y: number[];
  x?: number[];
  type: string;
  name: string;
  marker: PlotlyMarker;
  boxpoints: string;
}

declare interface PlotlyMarker {
  color: string;
  outliercolor: string;
  line: {
    outliercolor: string;
    outlierwidth: number;
  };
}
