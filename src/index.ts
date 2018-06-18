import { EventEmitter } from 'events';
import { AnyAction, Middleware } from 'redux';

export type PayloadCallback<A, S> = (
  action: AnyAction,
  currState: S,
  nextState: S
) => A | void | undefined | null;

export type Payload<A, S> = PayloadCallback<A, S> | A;

export interface PayloadInterface<A, S> {
  [name: string]: Array<Payload<A, S>>;
}

export type UserSendFunc<A, S> = (
  analytics: A,
  currState?: S
) => void;

export interface EventCallbackObj<S> {
  action: AnyAction;
  currState: S;
  nextState: S;
}

export class ReduxAnalyticsManager<A, S> {

  private send: UserSendFunc<A, S> | undefined;
  private payloads: PayloadInterface<A, S>;
  private emitter: EventEmitter;
  private initialized: boolean;

  constructor() {
    this.send = undefined;
    this.payloads = {};
    this.emitter = new EventEmitter();
    this.initialized = false;
  }

  public setSendMethod(fn: UserSendFunc<A, S>): void {
    this.send = fn;
  }

  public registerAction(
    type: string,
    payload: Payload<A, S> | Array<Payload<A, S>>
  ): void {

    if (!this.payloads[type]) {
      this.payloads[type] = [];
    }

    if (Array.isArray(payload)) {
      this.payloads[type] = this.payloads[type].concat(payload);
    } else {
      this.payloads[type].push(payload);
    }

    this.listen(type);
  }

  public createMiddleware(): Middleware {
    if (this.initialized) {
      throw Error('Can only call createMiddlware once');
    }

    if (!Object.keys(this.payloads).length) {
      throw Error(
        'No analytics actions registered. Register actions before ' +
        'calling createMiddleware'
      );
    }

    if (!this.send) {
      throw Error(
        'Must set an analytics send method before calling createMiddleware'
      );
    }

    this.initialized = true;

    return (store) => (next) => (action) => {
      if (!this.payloads[action.type]) { return next(action); }
      const currState = store.getState();
      const nextAction = next(action);
      const nextState = store.getState();
      this.emitter.emit(action.type, {action, currState, nextState});
      return nextAction;
    };
  }

  private emitterCallback(data: EventCallbackObj<S>): void  {
    const type = data.action.type;
    this.payloads[type].forEach((payload: Payload<A, S>) => {

      if (typeof payload === 'function') {
        payload = payload(data.action, data.currState, data.nextState) as A;
      }

      if (payload && this.send) {
        this.send(payload, data.currState);
      }
    });
  }

  private listen(type: string): void {
    this.emitter.on(type, this.emitterCallback.bind(this));
  }
}


