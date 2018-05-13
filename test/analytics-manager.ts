import * as chai from 'chai'
import { AnyAction, Middleware } from 'redux';
import { spy, SinonSpy } from 'sinon';
import * as Util from './util';
import * as AnalyticsManager from '../src';

interface Spies {
  [key: string]: SinonSpy;
}

const spies: Spies = {
  sendSpy: spy(),
  registerSpy2: spy(function() {return Util.analyticsObject2}),
  registerSpy3: spy(function() {return Util.analyticsObject3}),
  registerSpy4: spy(
    function(action: AnyAction, getState: AnalyticsManager.GetState) {
      const data = getState().data;
      if (Object.keys(data).length) { return data; }
      return action.data;
    }
  )
};

function resetSpyHistory() {
  for (const s in spies) {
    spies[s].resetHistory();
  }
}

function createAnalyticsMiddleware(): Middleware {
  const manager = new AnalyticsManager.default<Util.IAnalytics>();
  manager.setSendMethod(spies.sendSpy);
  manager.registerAction(Util.ACTION1, Util.analyticsObject1);
  manager.registerAction(Util.ACTION2, spies.registerSpy2);
  manager.registerAction(
    Util.ACTION3, [
    Util.analyticsObject1, spies.registerSpy3]
  );
  manager.registerAction(Util.SET_DATA, spies.registerSpy4);
  return manager.createMiddleware();
}

describe('Redux Analytics Manager - Functionality', function() {

  beforeEach(function() {
    resetSpyHistory();
    const middleware: Middleware = createAnalyticsMiddleware();
    this.store = Util.setUpStore(middleware);
  });

  it(
    'calls send method with analytics object and redux getState method ' +
    '- registered object',
    async function() {
      const sendSpy = spies.sendSpy;
      const analyticObj1 = Util.analyticsObject1;
      await this.store.dispatch(Util.actionCreator1());
      chai.expect(sendSpy.calledOnce).to.be.true;
      chai.expect(sendSpy.lastCall.args[0]).to.deep.equal(analyticObj1);
      chai.expect(sendSpy.lastCall.args[1].name).to.equal('getState');
    }
  );

  it(
    'calls send method with analytics object and redux getState method ' +
    '- registerd callback',
    async function() {
      const sendSpy = spies.sendSpy;
      const analyticObj2 = Util.analyticsObject2;
      await this.store.dispatch(Util.actionCreator2());
      chai.expect(sendSpy.calledOnce).to.be.true;
      chai.expect(sendSpy.lastCall.args[0]).to.deep.equal(analyticObj2);
      chai.expect(sendSpy.lastCall.args[1].name).to.equal('getState');
    }
  );

  it(
    'calls registered action callback with action and getState method',
    async function() {
      const registerSpy2 = spies.registerSpy2;
      const action2 = Util.actionCreator2();
      await this.store.dispatch(action2);
      chai.expect(registerSpy2.calledOnce).to.be.true;
      chai.expect(registerSpy2.lastCall.args[0]).to.deep.equal(action2);
    }
  );

  it('allows user to register an array of action listeners', async function() {
    const sendSpy = spies.sendSpy;
    const registerSpy3 = spies.registerSpy3;
    const analyticObj1 = Util.analyticsObject1;
    const analyticObj3 = Util.analyticsObject3;
    const action3 = Util.actionCreator3();
    await this.store.dispatch(action3);
    chai.expect(registerSpy3.calledOnce).to.be.true;
    chai.expect(registerSpy3.lastCall.args[0]).to.deep.equal(action3);
    chai.expect(sendSpy.firstCall.args[0]).to.deep.equal(analyticObj1);
    chai.expect(sendSpy.lastCall.args[0]).to.deep.equal(analyticObj3);
  });

  it('gives user access to state in registered callback', async function() {
    const sendSpy = spies.sendSpy;
    const data1 = {
      eventCategory: 'fake-category',
      eventAction: 'fake-action',
      eventLabel: 'fake-label'
    };
    const data2 = Util.analyticsObject4;
    await this.store.dispatch(Util.setData(data1));
    await this.store.dispatch(Util.setData(data2));
    chai.expect(sendSpy.firstCall.args[0]).to.deep.equal(data1);
    chai.expect(sendSpy.lastCall.args[0]).to.deep.equal(data1);
  });

  it(
    'does\'t call sendMethod or registered callbacks on non-registered actions',
    async function() {
      await this.store.dispatch({type: 'unregistered'});
      chai.expect(spies.sendSpy.calledOnce).to.be.false;
      chai.expect(spies.registerSpy2.calledOnce).to.be.false;
      chai.expect(spies.registerSpy3.calledOnce).to.be.false;
      chai.expect(spies.registerSpy4.calledOnce).to.be.false;
    }
  );
});

describe('Redux Analytics Manager - Errors', function() {
  it(
    'throws if createMiddleware is called without registering actions',
    function() {
      const manager = new AnalyticsManager.default<Util.IAnalytics>();
      manager.setSendMethod(() => console.log('send method set'));
      chai.expect(manager.createMiddleware.bind(manager)).to.throw();
    }
  );

  it(
    'throws if createMiddleware is called without setting send method',
    function() {
      const manager = new AnalyticsManager.default();
      manager.registerAction('Whatever', {data: 'data'});
      chai.expect(manager.createMiddleware.bind(manager)).to.throw();
    }
  );

  it(
    'throws if createMiddleware is called more than once',
    function() {
      const manager = new AnalyticsManager.default();
      manager.setSendMethod(function() {});
      manager.registerAction('Whatever', {data: 'data'});
      const middleware = manager.createMiddleware();
      const store = Util.setUpStore(middleware);
      store.dispatch({type: 'Whatever'});
      chai.expect(manager.createMiddleware.bind(manager)).to.throw();
    }
  );

  it(
    'throws if setSendMethod is called more than once',
    function() {
      const manager = new AnalyticsManager.default();
      manager.setSendMethod(() => console.log('send method set'));
      chai.expect(manager.setSendMethod.bind(manager)).to.throw();
    }
  );
});
