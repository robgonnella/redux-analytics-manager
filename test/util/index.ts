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

interface State {
  data: IAnalytics | {};
}

export const ACTION1 = 'ACTION1';
export const ACTION2 = 'ACTION2';
export const ACTION3 = 'ACTION3';
export const SET_DATA = 'SET_DATA';

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

export function setData(data: IAnalytics): IAnalyticsAction {
  return {
    type: SET_DATA,
    data
  }
}

function reducer(state: State = {data: {}}, action: AnyAction) {
  switch (action.type) {
    case SET_DATA:
      return {data: action.data};
    default:
      return state;
  }
}

export function setUpStore(middleware: Middleware) {
  return createStore(reducer, {data: {}}, applyMiddleware(middleware));
}
