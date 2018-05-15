import { Middleware, MiddlewareAPI } from 'redux';

export type GetState = () => any;

export type PayloadCallback<A> = (
  action: any,
  getState: GetState
) => A | void | undefined | null;

export type Payload<A> = PayloadCallback<A> | A;

export interface ListenerInterface<A> {
  [name: string]: Array<Payload<A>>;
}

export type UserSendFunc<A> = (analytics: A, getState?: GetState) => void;

export type SendFunc<A> = (analytics: A) => void;

export default class ReduxAnalyticsManager<A> {

  private send: SendFunc<A> | undefined;
  private listeners: ListenerInterface<A>;
  private store: MiddlewareAPI | undefined;

  constructor() {
    this.send = undefined;
    this.listeners = {};
    this.store = undefined;
  }

  public setSendMethod(fn: UserSendFunc<A>): void {
    if (this.send) {
      throw Error('Can only set analytics send method once');
    }

    this.send = (payload: A) => {
      if (!this.store) {
        throw Error(
          'Analytics manager store is missing. Make sure manager is ' +
          'initialized by calling the createMiddleware method'
        );
      }
      fn(payload, this.store.getState);
    };
  }

  public registerAction(
    type: string,
    payload: Payload<A> | Array<Payload<A>>
  ): void {

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

  private callListeners(action: any): void {

    const key = action.type;

    if (!this.listeners[key]) { return; }

    this.listeners[key].forEach((payload: Payload<A>) => {
      if (!this.store) {
        throw Error(
          'Analytics manager was never initialized with createMiddleware method'
        );
      }

      if (!this.send) {
        throw Error('Must set a send method before using analytics middleware');
      }

      if (typeof payload === 'function') {
        payload = payload(action, this.store.getState) as A;
      }

      if (payload) {
        this.send(payload);
      }
    });
  }
}


