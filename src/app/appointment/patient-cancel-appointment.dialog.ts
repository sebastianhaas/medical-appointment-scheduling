import { Component }   from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'patient-cancel-appointment-dialog',
  template: `
  <p i18n>Do you really want to cancel this appointment?</p>
  <button md-button i18n type="button" (click)="dialogRef.close('yes')">YES</button>
  <button md-button i18n type="button" (click)="dialogRef.close('no')">NO</button>
  `,
  styles: ['p { font-family: "Roboto"; }']
})
export class PatientCancelAppointmentDialogComponent {
  constructor(public dialogRef: MdDialogRef<PatientCancelAppointmentDialogComponent>) {}
}
