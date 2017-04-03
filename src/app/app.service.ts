import { Injectable } from '@angular/core';
import { Subject }    from 'rxjs/Rx';

export type InternalStateType = {
  [key: string]: any
};

@Injectable()
export class AppState {

  public _state: InternalStateType = { };

  /**
   * The title to be displayed.
   */
  public title: Subject<string> = new Subject<string>();

  /**
   * If the page to be displayed is a sub-page, setting this value to true will render a back arrow
   * instead of the menu button, and a click will trigger the browser to go back in history.
   */
  public isSubPage: Subject<boolean> = new Subject<boolean>();

  /**
   * Toolbar actions for the page
   */
  public actions: Subject<Action[]> = new Subject<Action[]>();

  /**
   * Primary actions of the page, displayed as fab.
   */
  public primaryAction: Subject<Action> = new Subject<Action>();

  // already return a clone of the current state
  public get state() {
    return this._state = this._clone(this._state);
  }
  // never allow mutation
  public set state(value) {
    throw new Error('do not mutate the `.state` directly');
  }

  public get(prop?: any) {
    // use our state getter for the clone
    const state = this.state;
    return state.hasOwnProperty(prop) ? state[prop] : state;
  }

  public set(prop: string, value: any) {
    // internally mutate our state
    return this._state[prop] = value;
  }

  private _clone(object: InternalStateType) {
    // simple object clone
    return JSON.parse(JSON.stringify( object ));
  }
}

export interface Action {
  icon: string;
  clickHandler?: Function;
  routerLink?: string;
}
