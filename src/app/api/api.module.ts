import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { Configuration } from './configuration';

import { AppointmentService } from './api/appointment.service';
import { AttendanceService } from './api/attendance.service';
import { AuditLogEntryService } from './api/auditLogEntry.service';
import { ExaminationService } from './api/examination.service';
import { MailService } from './api/mail.service';
import { NotificationService } from './api/notification.service';
import { PatientService } from './api/patient.service';
import { RoomService } from './api/room.service';

@NgModule({
  imports:      [ CommonModule, HttpModule ],
  declarations: [],
  exports:      [],
  providers:    [ AppointmentService, AttendanceService, AuditLogEntryService, ExaminationService, MailService, NotificationService, PatientService, RoomService ]
})
export class ApiModule {
    public static forConfig(configuration: Configuration): ModuleWithProviders {
        return {
            ngModule: ApiModule,
            providers: [ {provide: Configuration, useValue: configuration}]
        }
    }
}
