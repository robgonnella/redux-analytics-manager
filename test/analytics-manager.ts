import * as chai from 'chai'
import { createStore, applyMiddleware } from 'redux';
import { spy } from 'sinon';
import AnalyticsManager from '../src';

const ACTION1 = 'ACTION1';
const ACTION2 = 'ACTION2';
const ACTION3 = 'ACTION3';
const SET_DATA = 'SET_DATA';

const analyticsObject1 = {
  eventCategory: 'Category1',
  eventAction: 'Action1',
  eventLabel: 'Label1'
}

const analyticsObject2 = {
  eventCategory: 'Category2',
  eventAction: 'Action2',
  eventLabel: 'Label2'
}

const analyticsObject3 = {
  eventCategory: 'Category3',
  eventAction: 'Action3',
  eventLabel: 'Label3'
}

const analyticsObject4 = {
  eventCategory: 'Category4',
  eventAction: 'Action4',
  eventLabel: 'Label4'
}

function actionCreator1() {
  return {
    type: ACTION1,
    data: analyticsObject1
  };
}

function actionCreator2() {
  return {
    type: ACTION2,
    data: analyticsObject2
  };
}

function actionCreator3() {
  return {
    type: ACTION3,
    data: analyticsObject3
  };
}

function setData(data) {
  return {
    type: SET_DATA,
    data
  }
}

function reducer(state = {data: {}}, action) {
  switch (action.type) {
    case SET_DATA:
      return {data: action.data};
    default:
      return state;
  }
}

const sendSpy = spy();
const registerSpy2 = spy(function() {return analyticsObject2});
const registerSpy3 = spy(function() {return analyticsObject3});
const registerSpy4 = spy(function(action, getState) {
  const data = getState().data;
  if (Object.keys(data).length) { return {data}; }
  return {data: action.data};
});

function resetHistory() {
  sendSpy.resetHistory();
  registerSpy2.resetHistory();
  registerSpy3.resetHistory();
  registerSpy4.resetHistory();
}

function createAnalyticsMiddleware() {
  const manager = new AnalyticsManager();
  manager.setSendMethod(sendSpy);
  manager.registerAction(ACTION1, analyticsObject1);
  manager.registerAction(ACTION2, registerSpy2);
  manager.registerAction(ACTION3, [analyticsObject1, registerSpy3]);
  manager.registerAction(SET_DATA, registerSpy4);
  return manager.createMiddleware();
}

function setUpStore() {
  const middleware = createAnalyticsMiddleware();
  const store = createStore(reducer, {data: {}}, applyMiddleware(middleware));
  return store;
}

describe('Redux Analytics Manager', function() {

  beforeEach(function() {
    resetHistory();
    this.store = setUpStore();
  });

  it(
    'calls send method with analytics object and redux getState method ' +
    '- registered object',
    async function() {
      await this.store.dispatch(actionCreator1());
      chai.expect(sendSpy.calledOnce).to.be.true;
      chai.expect(sendSpy.lastCall.args[0]).to.deep.equal(analyticsObject1);
      chai.expect(sendSpy.lastCall.args[1].name).to.equal('getState');
    }
  );

  it(
    'calls send method with analytics object and redux getState method ' +
    '- registerd callback',
    async function() {
      await this.store.dispatch(actionCreator2());
      chai.expect(sendSpy.calledOnce).to.be.true;
      chai.expect(sendSpy.lastCall.args[0]).to.deep.equal(analyticsObject2);
      chai.expect(sendSpy.lastCall.args[1].name).to.equal('getState');
    }
  );

  it(
    'calls registered action callback with action and getState method',
    async function() {
      await this.store.dispatch(actionCreator2());
      chai.expect(registerSpy2.calledOnce).to.be.true;
      chai.expect(registerSpy2.lastCall.args[0]).to.deep.equal(actionCreator2());
    }
  );

  it('allows user to register an array of action listeners', async function() {
    await this.store.dispatch(actionCreator3());
    chai.expect(registerSpy3.calledOnce).to.be.true;
    chai.expect(registerSpy3.lastCall.args[0]).to.deep.equal(actionCreator3());
    chai.expect(sendSpy.firstCall.args[0]).to.deep.equal(analyticsObject1);
    chai.expect(sendSpy.lastCall.args[0]).to.deep.equal(analyticsObject3);

  });

  it('gives user access to state in registered callback', async function() {
    const data1 = 'some-data';
    const data2 = analyticsObject4;
    await this.store.dispatch(setData(data1));
    await this.store.dispatch(setData(data2));
    chai.expect(sendSpy.firstCall.args[0]).to.deep.equal({data: data1});
    chai.expect(sendSpy.lastCall.args[0]).to.deep.equal({data: data1});
  });

});
