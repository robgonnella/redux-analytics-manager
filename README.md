# Redux Analytics Manager

[![Build Status](https://travis-ci.com/robgonnella/redux-analytics-manager.svg?branch=master)](https://travis-ci.com/robgonnella/redux-analytics-manager)

This module works as redux middleware allowing you to listen for actions and
send a specified analytics object. You can also register callbacks instead
of sending vanilla objects. Action callbacks are passed the original action, the
current state, and the next state.

### Installation

`npm install --save 'redux-analytics-manager'`


### Usage

- Define a send method to be used with your registered actions. You can use
  any analytics library. The send method will be passed the the analytics
  object from the registered action along with the current state for further
  processing if necessary.
- Register actions with either analytics objects, or callbacks. Callbacks are
  passed the original action, the current state, and the next state. If the
  callback doesn't return anything the send method won't be called.
- Call the middleware create method

If you register the same action more than once, the calls to your send method
will occur in the order they were defined. You can also use `registerActions`
to register an array of actions to the same analytics object, callback, or a
mixed array.

```javascript
// Example using Google Analytics

import { applyMiddleware, createStore } from 'redux';
import { ReduxAnalyticsManager } from 'redux-analytics-manager';

const manager = new ReduxAnalyticsManager();

ga('create', 'UA-XXXXX-Y', 'auto');

function sendAnalytics(analyticObj, currState) {
    if (currState.analyticsEnabled) {
        ga('send', analyticsObj);
    }
}

manager.setSendMethod(sendAnalytics);

// Sending plain analytics object
manager.registerAction(
    'MY FANCY ACTION', 
    {
        eventCategory: 'fancy-actions',
        eventLabel: 'my fancy action'
    }
)

// Register callback and return analytics to be sent
manager.registerAction(
    'PURCHASE PRODUCT',
    (action, currState, nextState) => {
        const product = action.product;
        const region = currState.regionID;
        return {
            eventCategory: region,
            eventAction: 'product-purchase',
            eventLabel: product
        };
    }
);

// Register an array of listeners for a single action
manager.registerAction(
    'DOWNLOAD IMAGE',
    [
        {eventCategory: 'page-visits', eventAction: 'page-visited'},
        (action, currState, nextState) => {
            const imageName = action.image;
            const totalDownloads = nextState.images[imageName].downloads;
            return {
                eventCategory: 'Images',
                eventAction: 'image-downloaded',
                eventLabel: imageName,
                eventValue: totalDownloads
            };
        }
    ]
);

// Conditionally send analytics based on state
manager.registerAction(
    'LOGIN USER',
    (action, currState, nextState) => {
        const firstTime = (
            currState.loginCount = 0 && nextState.loginCount === 1;
        );
        if (firstTime) {
            return {
                eventCategory: 'First Time Events',
                eventAction: 'user-login',
                eventLabel: action.userName
            }
        }
    }
);

const analyticsMiddleware = manager.createMiddleware();

const store = createStore(rootReducer, applyMiddleware(analyticsMiddlware));

```

### Methods
- **constructor:**
    For typescript, pass an analytics object type and your appState type during
    instantiation
- **setSendMethod:**
    User defined function that will be called with registered analytics object
    or the returned analytics object from registered callback
- **createMiddleware:**
    Returns redux middleware to be used in the redux `applyMiddlware` method
- **registerAction:**
    Register a single action to an analytics object, callback, or mixed array
    of either
- **registerActions:**
    Register an array of actions to an analytics object, callback, or a mixed
    array of either
- **deRegisterAction:**
    Removes action listener and stops calling send method / callbacks for that
    action
- **deRegisterActions:**
    Removes action listeners for an array of actions
- **deRegisterAll:**
    Removes all action listeners
