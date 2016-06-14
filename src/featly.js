export default () => {

  const subscribersEnabled = {}
  const subscribersDisabled = {}
  const enabledFeatures = {}

  const isEnabled = feature => feature in enabledFeatures
  const isDisabled = feature => !isEnabled(feature)

  const fire = (subscribers, hasFired, setFired) =>
    feature => {
      if (!hasFired(feature)) {
        setFired(feature)
        if (feature in subscribers) {
          for (let i in subscribers[feature]) {
            subscribers[feature][i]()
          }
        }
      }
    }

  const subscribe = (subscribers, hasFired) =>
    (feature, subscriber) => {
      if (!(feature in subscribers)) {
        subscribers[feature] = []
      }
      subscribers[feature].push(subscriber)
      if (hasFired(feature)) {
        subscriber()
      }
    }

  return {
    enable: fire(subscribersEnabled, isEnabled, feature => {
      enabledFeatures[feature] = true
    }),
    disable: fire(subscribersDisabled, isDisabled, feature => {
      delete enabledFeatures[feature]
    }),
    isEnabled,
    isDisabled,
    whenEnabled: subscribe(subscribersEnabled, isEnabled),
    whenDisabled: subscribe(subscribersDisabled, isDisabled)
  }
}
