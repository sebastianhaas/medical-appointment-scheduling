import { Inject, Injectable, Optional } from '@angular/core';
import { OpaqueToken }                  from '@angular/core';

import { Subject }                      from 'rxjs/Rx';
import * as io                          from 'socket.io-client';

/**
 * An opaque token to configure the CantyCTI host to be used.
 */
export const CANTY_CTI_HOST = new OpaqueToken('cantyCtiHost');

/**
 * Keys for Socket.io events.
 */
const EVENT_KEY_INCOMING_CALL = 'incoming call';
const EVENT_KEY_CALL_REQUEST = 'call request';

export enum IncomingCallState {
  RINGING = 0,
  OFFHOOK = 1,
  IDLE = 2
}

declare interface IncomingCall {
  id: string;
  phoneNumber: string;
  callState: IncomingCallState;
}

declare interface CallRequest {
  phoneNumber: string;
}

@Injectable()
export class CantyCTIService {

  public incomingCall: Subject<IncomingCall> = new Subject<IncomingCall>();

  private socket: SocketIOClient.Socket;

  constructor(@Optional()@Inject(CANTY_CTI_HOST) host: string) {
    if (!host) {
      host = 'https://cantycti.herokuapp.com';
    }
    this.socket = io.connect(host);
    this.socket.on('connect', () => this.connect());
    this.socket.on('disconnect', () => this.disconnect());
    this.socket.on('error', (error: string) => {
      console.log(`ERROR: "${error}" (${host})`);
    });

    this.socket.on(EVENT_KEY_INCOMING_CALL, (incomingCallInfo: IncomingCall) => {
      this.incomingCall.next(incomingCallInfo);
      console.log(`Received incoming call event [${incomingCallInfo.id}],
       ${incomingCallInfo.phoneNumber} is
       ${IncomingCallState[incomingCallInfo.callState]}`);
    });
  }

  public requestCall(phoneNumber: string) {
    this.socket.emit(EVENT_KEY_CALL_REQUEST, { phoneNumber });
    console.log(`Requested to call ${phoneNumber}.`);
  }

  private connect() {
    console.log('Connected to socket host.');
  }

  private disconnect() {
    console.log('Disconnected from socket host.');
  }
}
