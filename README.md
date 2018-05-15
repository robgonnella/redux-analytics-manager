# Redux Analytics Manager

[![Build Status](https://travis-ci.com/robgonnella/redux-analytics-manager.svg?branch=master)](https://travis-ci.com/robgonnella/redux-analytics-manager)

This module works as redux middleware allowing you to listen for actions and
send a specified analytics object. You can also register callbacks instead
of sending vanilla objects. Callbacks are passed the original action
and the redux getState method.

### Installation

`npm install --save 'redux-analytics-manager'`


### Usage

- Define a send method to be used with your registered actions. You can use
  any analytics library. The send method will be passed the the analytics
  object from the registered action along with the redux getState method
  for further processing if necessary.
- Register actions with either analytics objects, or callbacks. Callbacks are
  passed the original action and the redux getState method. If the callback
  doesn't return anything the send method won't be called.
- Call the middleware create method

If you register the same action more than once, the calls to your send method
will occur in the order they were defined.

```javascript
// Example using Google Analytics

import { applyMiddleware, createStore } from 'redux';
import AnalyticsManager from 'redux-analytics-manager';

const manager = new AnalyticsManager();

ga('create', 'UA-XXXXX-Y', 'auto');

function sendAnalytics(analyticObj, getState) {
    ga('send', analyticsObj);
}

manager.setSendMethod(sendAnalytics);

// Sending plain object
manager.registerAction(
    'MY FANCY ACTION', 
    {
        eventCategory: 'fancy-actions',
        eventLabel: 'my fancy action'
    }
)

// Register callback and return analytics object to be sent
manager.registerAction(
    'SELECT PRODUCT',
    (action, getState) => {
        const product = action.product;
        const region = getState().regionID;
        return {
            eventCategory: region,
            eventAction: 'product-selection',
            eventLabel: product
        };
    }
);

// Register and array of listeners for a single action
manager.registerAction(
    'LOTS TO DO',
    [
        {eventCategory: 'page-visits', eventAction: 'page-visited'},
        (action, getState) => {
            const product = action.product;
            const region = getState().regionID;
            return {
                eventCategory: region,
                eventAction: 'product-selection',
                eventLabel: product
            };
        }
    ]
);

const analyticsMiddleware = manager.createMiddleware();

const store = createStore(rootReducer, applyMiddleware(analyticsMiddlware));

```
