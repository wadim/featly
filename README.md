# featly

Minimalistic sync & async feature toggle.

## Design goals
 - Sync & async
 - Minimalistic API (6 methods)
 - No dependencies
 - Works in the browser and in node
 - Tiny [[300B gzipped](src/featly.js)]

## Installation

```bash
npm install featly --save
```

## API

```js
import featly from 'featly'

feature = featly()

feature.enable('my-feature')
feature.disable('my-feature')

feature.isEnabled('my-feature')
feature.isDisabled('my-feature')

feature.whenEnabled('my-feature', callback)
feature.whenDisabled('my-feature', callback)
```

That's it!

## Good to know

1. Features are disabled by default.
2. You can subscribe both before and after enabling/disabling.
3. Calling `enable` (or `disable`) multiple times in a row will not cause subscribers to be called again unless the feature state actually changes.
4. Subscribers are called immediately (not deferred).
5. Subscribers are called sequentially in the order they are registered.

## Examples

#### Use async mode for features that can be enabled at any time.

```js
feature.whenEnabled('tracking', () => {
  $('button').on('click', () => {
    tracking.track('User clicked button')
  })
})
```

In the above example clicks will not be tracked if the `tracking` feature is never enabled.

You can enable the `tracking` feature with

```js
feature.enable('tracking')
```

You might also want to subscribe to the `tracking` feature in the click handler:

```js
$('button').on('click', () => {
  feature.whenEnabled('tracking', () => {
    tracking.track('User clicked button')
  })
})
```

When you enable the `tracking` feature, all previously registered clicks will be tracked in addition to the future ones.

#### Use sync mode for features which have irreversible side effects

```js
function track(event) {
  if (feature.isEnabled('track-user-agent')) {
    event.userAgent = navigator.userAgent
  }
  event.send()
}
```

We query the feature state in sync mode because we only care about the state of the feature *at this particular point in time*.
