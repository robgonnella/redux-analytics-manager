import { EventEmitter } from 'events';
import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux';

export type PayloadCallback<A, S> = (
  action: AnyAction,
  currState: S,
  nextState: S,
) => A | void | undefined | null;

export type Payload<A, S> = PayloadCallback<A, S> | A;

export interface PayloadInterface<A, S> {
  [name: string]: Payload<A, S>[];
}

export type UserSendFunc<A, S> = (analytics: A, currState?: S) => void;

export interface EventCallbackObj<S> {
  action: AnyAction;
  currState: S;
  nextState: S;
}

function isPayloadCallback<A, S>(p: any): p is PayloadCallback<A, S> {
  return typeof p === 'function';
}

export class ReduxAnalyticsManager<A = any, S = any> {
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

  public setSendMethod = (fn: UserSendFunc<A, S>): void => {
    this.send = fn;
  };

  public registerAction = (
    type: string,
    payload: Payload<A, S> | Payload<A, S>[],
  ): void => {
    if (!this.payloads[type]) {
      this.payloads[type] = [];
    }

    if (Array.isArray(payload)) {
      this.payloads[type] = this.payloads[type].concat(payload);
    } else {
      this.payloads[type].push(payload);
    }

    this.listen(type);
  };

  public registerActions = (
    types: string[],
    payload: Payload<A, S> | Payload<A, S>[],
  ): void => {
    for (let i = 0; i < types.length; ++i) {
      this.registerAction(types[i], payload);
    }
  };

  public deRegisterAction = (type: string): void => {
    delete this.payloads[type];
    this.emitter.removeListener(type, this.emitterCallback);
  };

  public deRegisterActions = (types: string[]): void => {
    for (let i = 0; i < types.length; ++i) {
      this.deRegisterAction(types[i]);
    }
  };

  public deRegisterAll = (): void => {
    this.payloads = {};
    this.emitter.removeAllListeners();
  };

  public createMiddleware = (): Middleware => {
    if (this.initialized) {
      throw Error('Can only call createMiddlware once');
    }

    if (!this.send) {
      throw Error(
        'Must set an analytics send method before calling createMiddleware',
      );
    }

    this.initialized = true;

    return (store: MiddlewareAPI) => (next: Dispatch<AnyAction>) => (
      action: AnyAction,
    ) => {
      if (!this.payloads[action.type]) {
        return next(action);
      }
      const currState = store.getState();
      const nextAction = next(action);
      const nextState = store.getState();
      this.emitter.emit(action.type, { action, currState, nextState });
      return nextAction;
    };
  };

  private emitterCallback = (data: EventCallbackObj<S>): void => {
    const type = data.action.type;
    this.payloads[type].forEach((payload: Payload<A, S>) => {
      if (isPayloadCallback<A, S>(payload)) {
        payload = payload(data.action, data.currState, data.nextState) as A;
      }

      if (payload && this.send) {
        this.send(payload, data.currState);
      }
    });
  };

  private listen = (type: string): void => {
    this.emitter.on(type, this.emitterCallback);
  };
}
