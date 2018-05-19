import { createStore, AnyAction, Middleware, applyMiddleware } from 'redux';

export interface IAnalytics {
  eventCategory: string;
  eventAction: string;
  eventLabel: string;
}

interface IAnalyticsAction {
  type: string;
  data: IAnalytics;
}

export interface State {
  data: IAnalytics;
}

export const ACTION0 = 'ACTION0';
export const ACTION1 = 'ACTION1';
export const ACTION2 = 'ACTION2';
export const ACTION3 = 'ACTION3';
export const ACTION4 = 'ACTION4';
export const ACTION5 = 'ACTION5';

export const analyticsObject0: IAnalytics = {
  eventCategory: 'Category0',
  eventAction: 'Action0',
  eventLabel: 'Label0'
}

export const analyticsObject1: IAnalytics = {
  eventCategory: 'Category1',
  eventAction: 'Action1',
  eventLabel: 'Label1'
}

export const analyticsObject2: IAnalytics = {
  eventCategory: 'Category2',
  eventAction: 'Action2',
  eventLabel: 'Label2'
}

export const analyticsObject3: IAnalytics = {
  eventCategory: 'Category3',
  eventAction: 'Action3',
  eventLabel: 'Label3'
}

export const analyticsObject4: IAnalytics = {
  eventCategory: 'Category4',
  eventAction: 'Action4',
  eventLabel: 'Label4'
}

export const analyticsObject5: IAnalytics = {
  eventCategory: 'Category5',
  eventAction: 'Action5',
  eventLabel: 'Label5'
}

export function actionCreator0(): IAnalyticsAction {
  return {
    type: ACTION0,
    data: analyticsObject0
  };
}

export function actionCreator1(): IAnalyticsAction {
  return {
    type: ACTION1,
    data: analyticsObject1
  };
}

export function actionCreator2(): IAnalyticsAction {
  return {
    type: ACTION2,
    data: analyticsObject2
  };
}

export function actionCreator3(): IAnalyticsAction {
  return {
    type: ACTION3,
    data: analyticsObject3
  };
}

export function actionCreator4(): IAnalyticsAction {
  return {
    type: ACTION4,
    data: analyticsObject4
  };
}

export function actionCreator5(): IAnalyticsAction {
  return {
    type: ACTION5,
    data: analyticsObject5
  };
}

export const initialState: State = {data: analyticsObject0};

function reducer(state: State = initialState, action: AnyAction) {
  if (!action.data) { return state; }
  return {data: action.data};
}

export function setUpStore(middleware: Middleware) {
  return createStore(reducer, applyMiddleware(middleware));
}
