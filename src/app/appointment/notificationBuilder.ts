import * as Handlebars           from 'handlebars/dist/handlebars';
import * as later                from 'later';
import * as moment               from 'moment';

import { Appointment }           from '../api/model/appointment';
import { Notification }          from '../api/model/notification';
import { NotificationTransport } from '../api/model/notificationTransport';

export class NotificationBuilder {
  public static getNotification(
    appointment: Appointment,
    emailAddress: string,
    phoneNumber: string
  ): Notification {

    if (!appointment || (!emailAddress && !phoneNumber)) {
      return undefined;
    }
    // Time to deliver this notification
    const schedule = later.parse.recur()
      .on(0).second()
      .on(0).minute()
      .on(13).hour()
      .on(later.dayOfYear.val(
        moment(appointment.start).utc().startOf('day').subtract(1, 'day').toDate()
      )).dayOfYear()
      .on(later.year.val(moment(appointment.start).utc().toDate())).year();

    // Transports to deliver this notification
    const transports: NotificationTransport[] = [];
    if (emailAddress) {
      transports.push({
        address: emailAddress,
        type: 'mail'
      });
    }
    if (phoneNumber) {
      transports.push({
        address: phoneNumber,
        type: 'sms'
      });
    }

    return {
      schedule,
      transports,
      subject: emailAddress ? 'Your appointment tomorrow' : undefined,
      contentHtml: NotificationBuilder.contentHtml(appointment),
      contentText: NotificationBuilder.contentText(appointment),
      appointmentId: appointment.id,
      patientId: appointment.patientId
    };
  }

  private static contentHtml(appointment: Appointment): string {
    const template = Handlebars.compile(require('./notificationTemplate.html'));
    const data = { time: moment(appointment.start).format('LT') };
    return template(data);
  }

  private static contentText(appointment: Appointment): string {

    return localStorage.getItem('locale').startsWith('de') ?

      'Sehr geehrter Patient, wir möchten Sie höflichst an Ihren Termin morgen um ' +
      moment(appointment.start).format('LT') +
      'erinnern. Mit freundlichen Grüßen, die Rezeption Ihres Arztes.'

      :

      'Dear patient, we would like to remind you of your appointment tomorrow at ' +
      moment(appointment.start).format('LT') +
      '. Kind regards, Sebastian from your doctor\'s office.';
  }
}
