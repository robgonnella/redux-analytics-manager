import { Action, GetState, Middleware, MiddlewareAPI } from 'redux';


export interface AnalyticsObj {
  [name: string]: boolean | string | number;
}

export type PayloadCallback = (
  action: Action,
  getState: GetState
) => AnalyticsObj;

export type Payload = PayloadCallback | AnalyticsObj;

export interface ListenerInterface {
  [name: string]: Payload[];
}

export type UserSendFunc = (
  analytics: AnalyticsObj,
  getState?: GetState
) => void;

export type SendFunc = (analytics: AnalyticsObj ) => void;


export default class ReduxAnalyticsManager {

  private send: SendFunc | undefined;
  private listeners: ListenerInterface;
  private store: MiddlewareAPI | undefined;

  constructor() {
    this.send = undefined;
    this.listeners = {};
    this.store = undefined;
  }

  public setSendMethod(fn: UserSendFunc): void {
    if (this.send) {
      throw Error('Can only set analytics send method once');
    }

    this.send = (payload: AnalyticsObj) => {
      if (!this.store) {
        throw Error(
          'Analytics manager store is missing. Make sure manager is ' +
          'initialized by calling the createMiddleware method'
        );
      }
      fn(payload, this.store.getState);
    };
  }

  public registerAction(type: string, payload: Payload | Payload[]): void {

    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    if (Array.isArray(payload)) {
      this.listeners[type] = this.listeners[type].concat(payload);
    } else {
      this.listeners[type].push(payload);
    }
  }

  public createMiddleware(): Middleware {

    if (this.store) {
      throw Error('Can only call createMiddleware once');
    }

    if (!Object.keys(this.listeners).length) {
      throw Error(
        'No analytics actions registered. Register actions before calling ' +
        'createMiddleware'
      );
    }

    if (!this.send) {
      throw Error(
        'Must set an analytics send method before calling createMiddleware'
      );
    }

    return (store) => (next) => (action) => {
      this.store = store;
      this.callListeners(action);
      return next(action);
    };
  }

  private callListeners(action: Action): void {

    const key = action.type;

    if (!this.listeners[key]) { return; }

    this.listeners[key].forEach((payload: Payload) => {
      if (!this.store) {
        throw Error(
          'Analytics manager was never initialized with createMiddleware method'
        );
      }

      if (!this.send) {
        throw Error('Must set a send method before using analytics middleware');
      }

      if (typeof payload === 'function') {
        payload = payload(action, this.store.getState);
      }

      this.send(payload);
    });
  }
}


