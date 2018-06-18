import * as chai from 'chai'
import { AnyAction, Middleware } from 'redux';
import { spy, SinonSpy } from 'sinon';
import * as Util from './util';
import * as AnalyticsManager from '../src';

const ReduxAnalyticsManager = AnalyticsManager.ReduxAnalyticsManager;

interface Spies {
  [key: string]: SinonSpy;
}

const spies: Spies = {
  registerSpy0: spy(),
  sendSpy: spy(),
  registerSpy2: spy(() => Util.analyticsObject2),
  registerSpy3: spy(() => Util.analyticsObject3),
  registerSpy4: spy(
    (action: AnyAction, currState: Util.State, nextState: Util.State) => {
      return currState.data;
    }
  ),
  registerSpy5: spy(
    (action: AnyAction, currState: Util.State, nextState: Util.State) => {
      return nextState.data;
    }
  )
};

function resetSpyHistory() {
  for (const s in spies) {
    spies[s].resetHistory();
  }
}

function createAnalyticsMiddleware(): Middleware {
  const manager = new ReduxAnalyticsManager<Util.IAnalytics, Util.State>();
  manager.setSendMethod(spies.sendSpy);
  manager.registerAction(Util.ACTION0, spies.registerSpy0);
  manager.registerAction(Util.ACTION1, Util.analyticsObject1);
  manager.registerAction(Util.ACTION2, spies.registerSpy2);
  manager.registerAction(
    Util.ACTION3, [
    Util.analyticsObject1, spies.registerSpy3]
  );
  manager.registerAction(Util.ACTION4, spies.registerSpy4);
  manager.registerAction(Util.ACTION5, spies.registerSpy5);
  return manager.createMiddleware();
}

describe('Redux Analytics Manager - Functionality', function() {

  beforeEach(function() {
    resetSpyHistory();
    const middleware: Middleware = createAnalyticsMiddleware();
    this.store = Util.setUpStore(middleware);
  });

  it(
    'calls send method with analytics object and current state ' +
    '- registered object',
    async function() {
      const sendSpy = spies.sendSpy;
      const analyticObj1 = Util.analyticsObject1;
      await this.store.dispatch(Util.actionCreator1());
      chai.expect(sendSpy.calledOnce).to.be.true;
      chai.expect(sendSpy.lastCall.args[0]).to.deep.equal(analyticObj1);
      chai.expect(sendSpy.lastCall.args[1]).to.deep.equal(Util.initialState);
    }
  );

  it(
    'calls send method with analytics object and current state ' +
    '- registerd callback',
    async function() {
      const sendSpy = spies.sendSpy;
      const analyticObj2 = Util.analyticsObject2;
      await this.store.dispatch(Util.actionCreator2());
      chai.expect(sendSpy.calledOnce).to.be.true;
      chai.expect(sendSpy.lastCall.args[0]).to.deep.equal(analyticObj2);
      chai.expect(sendSpy.lastCall.args[1]).to.deep.equal(Util.initialState);
    }
  );

  it(
    'calls registered action callback with action, currState, and nextState',
    async function() {
      const registerSpy2 = spies.registerSpy2;
      const analyticObj2 = Util.analyticsObject2;
      const action2 = Util.actionCreator2();
      await this.store.dispatch(action2);
      chai.expect(registerSpy2.calledOnce).to.be.true;
      chai.expect(registerSpy2.lastCall.args[0]).to.deep.equal(action2);
      chai.expect(registerSpy2.lastCall.args[1]).to.deep.equal(
        Util.initialState
      );
      chai.expect(registerSpy2.lastCall.args[2]).to.deep.equal(
        {data: analyticObj2}
      );
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

  it('gives user access to currState in registered callback',
    async function() {
      const sendSpy = spies.sendSpy;
      await this.store.dispatch(Util.actionCreator4());
      chai.expect(
        sendSpy.firstCall.args[0]
      ).to.deep.equal(Util.initialState.data);
    }
  );

  it('gives user access to nextState in registered callback',
    async function() {
      const sendSpy = spies.sendSpy;
      const analytics = Util.analyticsObject5;
      await this.store.dispatch(Util.actionCreator5());
      chai.expect(sendSpy.firstCall.args[0]).to.deep.equal(analytics);
    }
  );

  it(
    'doesn\'t call sendMethod or registered callbacks on unregistered actions',
    async function() {
      await this.store.dispatch({type: 'unregistered'});
      chai.expect(spies.sendSpy.calledOnce).to.be.false;
      chai.expect(spies.registerSpy2.calledOnce).to.be.false;
      chai.expect(spies.registerSpy3.calledOnce).to.be.false;
      chai.expect(spies.registerSpy4.calledOnce).to.be.false;
    }
  );

  it (
    'doesn\'t call send if action callback returns void',
    async function() {
      await this.store.dispatch(Util.actionCreator0());
      chai.expect(spies.registerSpy0.calledOnce).to.be.true;
      chai.expect(spies.sendSpy.calledOnce).to.be.false;
    }
  );
});

describe('Redux Analytics Manager - Errors', function() {
  it(
    'throws if createMiddleware is called without registering actions',
    function() {
      const manager = new ReduxAnalyticsManager<Util.IAnalytics, Util.State>();
      manager.setSendMethod(() => console.log('send method set'));
      chai.expect(manager.createMiddleware.bind(manager)).to.throw();
    }
  );

  it(
    'throws if createMiddleware is called without setting send method',
    function() {
      const manager = new ReduxAnalyticsManager<Util.IAnalytics, Util.State>();
      manager.registerAction('Whatever', Util.analyticsObject1);
      chai.expect(manager.createMiddleware.bind(manager)).to.throw();
    }
  );

  it(
    'throws if createMiddleware is called more than once',
    function() {
      const manager = new ReduxAnalyticsManager<Util.IAnalytics, Util.State>();
      manager.setSendMethod(function() {});
      manager.registerAction('Whatever', Util.analyticsObject1);
      const middleware = manager.createMiddleware();
      const store = Util.setUpStore(middleware);
      store.dispatch({type: 'Whatever'});
      chai.expect(manager.createMiddleware.bind(manager)).to.throw();
    }
  );
});
