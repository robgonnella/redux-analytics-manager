import * as chai from 'chai';
import { AnyAction, Middleware } from 'redux';
import { SinonSpy, spy } from 'sinon';
import { ReduxAnalyticsManager } from '../dist';
import * as Util from './util';

let manager: ReduxAnalyticsManager<Util.IAnalytics, Util.State>;

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
    },
  ),
  registerSpy5: spy(
    (action: AnyAction, currState: Util.State, nextState: Util.State) => {
      return nextState.data;
    },
  ),
  registerSpy6: spy(
    (action: AnyAction, currState: Util.State, nextState: Util.State) => {
      return nextState.data;
    },
  ),
};

function resetSpyHistory() {
  for (const s in spies) {
    spies[s].resetHistory();
  }
}

function createAnalyticsMiddleware(): Middleware {
  manager = new ReduxAnalyticsManager<Util.IAnalytics, Util.State>();
  manager.setSendMethod(spies.sendSpy);
  manager.registerAction(Util.ACTION0, spies.registerSpy0);
  manager.registerAction(Util.ACTION1, Util.analyticsObject1);
  manager.registerAction(Util.ACTION2, spies.registerSpy2);
  manager.registerAction(Util.ACTION3, [
    Util.analyticsObject1,
    spies.registerSpy3,
  ]);
  manager.registerAction(Util.ACTION4, spies.registerSpy4);
  manager.registerAction(Util.ACTION5, spies.registerSpy5);
  manager.registerActions([Util.ACTION6, Util.ACTION7], spies.registerSpy6);
  return manager.createMiddleware();
}

describe('Redux Analytics Manager - Functionality', function () {
  beforeEach(function () {
    resetSpyHistory();
    const middleware: Middleware = createAnalyticsMiddleware();
    this.store = Util.setUpStore(middleware);
  });

  it(
    'calls send method with analytics object and current state ' +
      '- registered object',
    async function () {
      const sendSpy = spies.sendSpy;
      const analyticObj1 = Util.analyticsObject1;
      await this.store.dispatch(Util.actionCreator1());
      chai.expect(sendSpy.calledOnce).to.be.true;
      chai.expect(sendSpy.lastCall.args[0]).to.deep.equal(analyticObj1);
      chai.expect(sendSpy.lastCall.args[1]).to.deep.equal(Util.initialState);
    },
  );

  it(
    'calls send method with analytics object and current state ' +
      '- registerd callback',
    async function () {
      const sendSpy = spies.sendSpy;
      const analyticObj2 = Util.analyticsObject2;
      await this.store.dispatch(Util.actionCreator2());
      chai.expect(sendSpy.calledOnce).to.be.true;
      chai.expect(sendSpy.lastCall.args[0]).to.deep.equal(analyticObj2);
      chai.expect(sendSpy.lastCall.args[1]).to.deep.equal(Util.initialState);
    },
  );

  it('calls registered action callback with action, currState, and nextState', async function () {
    const registerSpy2 = spies.registerSpy2;
    const analyticObj2 = Util.analyticsObject2;
    const action2 = Util.actionCreator2();
    await this.store.dispatch(action2);
    chai.expect(registerSpy2.calledOnce).to.be.true;
    chai.expect(registerSpy2.lastCall.args[0]).to.deep.equal(action2);
    chai.expect(registerSpy2.lastCall.args[1]).to.deep.equal(Util.initialState);
    chai
      .expect(registerSpy2.lastCall.args[2])
      .to.deep.equal({ data: analyticObj2 });
  });

  it('allows user to register an array of action listeners', async function () {
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

  it('allows users to register and array of actions', async function () {
    const sendSpy = spies.sendSpy;
    const analyticObj6 = Util.analyticsObject6;
    const analyticObj7 = Util.analyticsObject7;
    const registerSpy6 = spies.registerSpy6;
    const action6 = Util.actionCreator6();
    const action7 = Util.actionCreator7();
    await this.store.dispatch(action6);
    await this.store.dispatch(action7);
    chai.expect(registerSpy6.firstCall.args[0]).to.deep.equal(action6);
    chai.expect(registerSpy6.lastCall.args[0]).to.deep.equal(action7);
    chai.expect(registerSpy6.callCount).to.be.equal(2);
    chai.expect(sendSpy.firstCall.args[0]).to.deep.equal(analyticObj6);
    chai.expect(sendSpy.lastCall.args[0]).to.deep.equal(analyticObj7);
  });

  it('gives user access to currState in registered callback', async function () {
    const sendSpy = spies.sendSpy;
    await this.store.dispatch(Util.actionCreator4());
    chai
      .expect(sendSpy.firstCall.args[0])
      .to.deep.equal(Util.initialState.data);
  });

  it('gives user access to nextState in registered callback', async function () {
    const sendSpy = spies.sendSpy;
    const analytics = Util.analyticsObject5;
    await this.store.dispatch(Util.actionCreator5());
    chai.expect(sendSpy.firstCall.args[0]).to.deep.equal(analytics);
  });

  it("doesn't call sendMethod or registered callbacks on unregistered actions", async function () {
    await this.store.dispatch({ type: 'unregistered' });
    chai.expect(spies.sendSpy.calledOnce).to.be.false;
    chai.expect(spies.registerSpy2.calledOnce).to.be.false;
    chai.expect(spies.registerSpy3.calledOnce).to.be.false;
    chai.expect(spies.registerSpy4.calledOnce).to.be.false;
  });

  it("doesn't call send if action callback returns void", async function () {
    await this.store.dispatch(Util.actionCreator0());
    chai.expect(spies.registerSpy0.calledOnce).to.be.true;
    chai.expect(spies.sendSpy.calledOnce).to.be.false;
  });

  it('allows users to de-register an action', async function () {
    const sendSpy = spies.sendSpy;
    await this.store.dispatch(Util.actionCreator1());
    chai.expect(sendSpy.callCount).to.equal(1);
    manager.deRegisterAction(Util.ACTION1);
    await this.store.dispatch(Util.actionCreator1());
    chai.expect(sendSpy.callCount).to.equal(1);
  });

  it('allows users to de-register an array of actions', async function () {
    const sendSpy = spies.sendSpy;
    await this.store.dispatch(Util.actionCreator1());
    await this.store.dispatch(Util.actionCreator2());
    chai.expect(sendSpy.callCount).to.equal(2);
    manager.deRegisterActions([Util.ACTION1, Util.ACTION2]);
    await this.store.dispatch(Util.actionCreator1());
    await this.store.dispatch(Util.actionCreator2());
    chai.expect(sendSpy.callCount).to.equal(2);
  });

  it('allows users to de-register all actions at once', async function () {
    const sendSpy = spies.sendSpy;
    manager.deRegisterAll();
    await this.store.dispatch(Util.actionCreator1());
    await this.store.dispatch(Util.actionCreator2());
    await this.store.dispatch(Util.actionCreator3());
    await this.store.dispatch(Util.actionCreator4());
    await this.store.dispatch(Util.actionCreator5());
    await this.store.dispatch(Util.actionCreator6());
    await this.store.dispatch(Util.actionCreator7());
    chai.expect(sendSpy.calledOnce).to.be.false;
  });

  it('allows user to re-register actions', async function () {
    const sendSpy = spies.sendSpy;
    await this.store.dispatch(Util.actionCreator1());
    chai.expect(sendSpy.callCount).to.equal(1);
    manager.deRegisterAction(Util.ACTION1);
    await this.store.dispatch(Util.actionCreator1());
    chai.expect(sendSpy.callCount).to.equal(1);
    manager.registerAction(Util.ACTION1, Util.analyticsObject1);
    await this.store.dispatch(Util.actionCreator1());
    chai.expect(sendSpy.callCount).to.equal(2);
  });
});

describe('Redux Analytics Manager - Errors', function () {
  it('throws if createMiddleware is called without setting send method', function () {
    manager = new ReduxAnalyticsManager<Util.IAnalytics, Util.State>();
    manager.registerAction('Whatever', Util.analyticsObject1);
    chai.expect(manager.createMiddleware.bind(manager)).to.throw();
  });

  it('throws if createMiddleware is called more than once', function () {
    manager = new ReduxAnalyticsManager<Util.IAnalytics, Util.State>();
    manager.setSendMethod(function () {});
    manager.registerAction('Whatever', Util.analyticsObject1);
    const middleware = manager.createMiddleware();
    const store = Util.setUpStore(middleware);
    store.dispatch({ type: 'Whatever' });
    chai.expect(manager.createMiddleware.bind(manager)).to.throw();
  });
});
