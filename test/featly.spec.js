import expect from 'expect'
import featly from '../src/featly.js'

let feature

describe('featly', () => {

  it('is a function', () => {
    expect(featly).toBeA('function')
  })

  describe('invoked', () => {
    beforeEach(() => {
      feature = featly()
    });

    it('is an object', () => {
      expect(feature).toBeA('object')
    })

    it('exports exactly six methods', () => {
      const keys = Array.prototype.sort(Object.keys(feature))
      const expectedKeys = Array.prototype.sort(['enable', 'disable', 'isEnabled', 'isDisabled', 'whenEnabled', 'whenDisabled'])
      expect(keys).toEqual(expectedKeys)
    })

    describe('.whenEnabled()', () => {
      it('is a function', () => {
        expect(feature.whenEnabled).toBeA('function')
      })

      it('does not invoke the subscriber for an unknown feature', () => {
        const spy = expect.createSpy()
        feature.whenEnabled('feature-name', spy)
        expect(spy).toNotHaveBeenCalled()
      })
    })

    describe('.whenDisabled()', () => {
      it('is a function', () => {
        expect(feature.whenDisabled).toBeA('function')
      })

      it('invokes the subscriber for an unknown feature', () => {
        const spy = expect.createSpy()
        feature.whenDisabled('feature-name', spy)
        expect(spy).toHaveBeenCalled()
      })
    })

    describe('.isEnabled()', () => {
      it('is a function', () => {
        expect(feature.isEnabled).toBeA('function')
      })

      it('returns false for unknown features', () => {
        expect(feature.isEnabled('f')).toBe(false)
      })
    })

    describe('.isDisabled()', () => {
      it('is a function', () => {
        expect(feature.isDisabled).toBeA('function')
      })

      it('returns true for unknown features', () => {
        expect(feature.isDisabled('f')).toBe(true)
      })
    })

    describe('.enable()', () => {
      it('is a function', () => {
        expect(feature.enable).toBeA('function')
      })

      it('can enable a feature without registered subscribers', () => {
         feature.enable('feature-name')
      })

      it('enables a feature', () => {
        feature.enable('f1')
        expect(feature.isEnabled('f1')).toBe(true)
        expect(feature.isDisabled('f1')).toBe(false)
      })
    })

    describe('.disable()', () => {
      it('is a function', () => {
        expect(feature.disable).toBeA('function')
      })

      it('disables a feature', () => {
        feature.enable('f1')
        expect(feature.isEnabled('f1')).toBe(true)
        expect(feature.isDisabled('f1')).toBe(false)
        feature.disable('f1')
        expect(feature.isEnabled('f1')).toBe(false)
        expect(feature.isDisabled('f1')).toBe(true)
      })

      it('can disable an unknown feature', () => {
         feature.disable('feature-name')
      })
    })

    describe('.enable() and .whenEnabled()', () => {
      describe('1 succession', () => {
        describe('.whenEnabled() -> .enable()', () => {
          describe('.whenEnabled(f1) -> .enable(f1)', () => {
            it('invokes the subscriber for f1', () => {
              const spy = expect.createSpy()
              feature.whenEnabled('f1', spy)
              feature.enable('f1')
              expect(spy).toHaveBeenCalled()
            })
          })

          describe('.whenEnabled(f1) -> .enable(f2)', () => {
            it('does not invoke the subscriber for f2', () => {
              const spy = expect.createSpy()
              feature.whenEnabled('f1', spy)
              feature.enable('f2')
              expect(spy).toNotHaveBeenCalled()
            })
          })
        })

        describe('.enable() -> .whenEnabled()', () => {
          describe('.enable(f1) -> .whenEnabled(f1)', () => {
            it('invokes the subscriber for f1', () => {
              const spy = expect.createSpy()
              feature.enable('f1')
              feature.whenEnabled('f1', spy)
              expect(spy).toHaveBeenCalled()
            })
          })

          describe('.enable(f1) -> .whenEnabled(f2)', () => {
            it('does not invoke the subscriber for f2', () => {
              const spy = expect.createSpy()
              feature.enable('f1')
              feature.whenEnabled('f2', spy)
              expect(spy).toNotHaveBeenCalled()
            })
          })
        })
      })

      describe('2 successions', () => {
        describe('2 .whenEnabled() calls', () => {
          describe('.whenEnabled() -> .whenEnabled() -> .enable()', () => {
            describe('.whenEnabled(f1) -> .whenEnabled(f2) -> .enable(f1)', () => {
              it('invokes the subscriber for f1 but not for f2', () => {
                const spyOne = expect.createSpy()
                const spyTwo = expect.createSpy()
                feature.whenEnabled('f1', spyOne)
                feature.whenEnabled('f2', spyTwo)
                feature.enable('f1')
                expect(spyOne).toHaveBeenCalled()
                expect(spyTwo).toNotHaveBeenCalled()
              })
            })

            describe('.whenEnabled(f1) -> .whenEnabled(f1) -> .enable(f1)', () => {
              it('invokes both subscribers for f1', () => {
                const spyOne = expect.createSpy()
                const spyTwo = expect.createSpy()
                feature.whenEnabled('f1', spyOne)
                feature.whenEnabled('f1', spyTwo)
                feature.enable('f1')
                expect(spyOne).toHaveBeenCalled()
                expect(spyTwo).toHaveBeenCalled()
              })
            })
          })

          describe('.enable() -> .whenEnabled() -> .whenEnabled()', () => {
            describe('.enable(f1) -> .whenEnabled(f2) -> .whenEnabled(f1)', () => {
              it('invokes the subscriber for f1 but not for f2', () => {
                const spyOne = expect.createSpy()
                const spyTwo = expect.createSpy()
                feature.enable('f1')
                feature.whenEnabled('f2', spyOne)
                feature.whenEnabled('f1', spyTwo)
                expect(spyOne).toNotHaveBeenCalled()
                expect(spyTwo).toHaveBeenCalled()
              })
            })

            describe('.enable(f1) -> .whenEnabled(f1) -> .whenEnabled(f1)', () => {
              it('invokes both subscribers for f1', () => {
                const spyOne = expect.createSpy()
                const spyTwo = expect.createSpy()
                feature.enable('feature-name')
                feature.whenEnabled('feature-name', spyOne)
                feature.whenEnabled('feature-name', spyTwo)
                expect(spyOne).toHaveBeenCalled()
                expect(spyTwo).toHaveBeenCalled()
              })
            })
          })
        })

        describe('2 .enable() calls', () => {
          describe('.enable() -> .enable() -> .whenEnabled()', () => {
            describe('.enable(f1) -> .enable(f2) -> .whenEnabled(f1)', () => {
              it('invokes the subscriber for f1', () => {
                const spy = expect.createSpy()
                feature.enable('f1')
                feature.enable('f2')
                feature.whenEnabled('f1', spy)
                expect(spy).toHaveBeenCalled()
              })
            })
          })

          describe('.whenEnabled() -> .enable() -> .enable()', () => {
            describe('.whenEnabled(f1) -> .enable(f1) -> .enable(f1)', () => {
              it('invokes the subscriber only once', () => {
                const spy = expect.createSpy()
                feature.whenEnabled('f1', spy)
                feature.enable('f1')
                spy.reset()
                feature.enable('f1')
                expect(spy).toNotHaveBeenCalled()
              })
            })
          })
        })
      })
    })

    describe('.disable() and .whenDisabled()', () => {

      beforeEach(() => {
        feature.enable('f1')
        feature.enable('f2')
      })

      describe('1 succession', () => {
        describe('.whenDisabled() -> .disable()', () => {
          describe('.whenDisabled(f1) -> .disable(f1)', () => {
            it('invokes the subscriber for f1', () => {
              const spy = expect.createSpy()
              feature.whenDisabled('f1', spy)
              feature.disable('f1')
              expect(spy).toHaveBeenCalled()
            })
          })

          describe('.whenDisabled(f1) -> .disable(f2)', () => {
            it('does not invoke the subscriber for f2', () => {
              const spy = expect.createSpy()
              feature.whenDisabled('f1', spy)
              feature.disable('f2')
              expect(spy).toNotHaveBeenCalled()
            })
          })
        })

        describe('.disable() -> .whenDisabled()', () => {
          describe('.disable(f1) -> .whenDisabled(f1)', () => {
            it('invokes the subscriber for f1', () => {
              const spy = expect.createSpy()
              feature.disable('f1')
              feature.whenDisabled('f1', spy)
              expect(spy).toHaveBeenCalled()
            })
          })

          describe('.disable(f1) -> .whenDisabled(f2)', () => {
            it('does not invoke the subscriber for f2', () => {
              const spy = expect.createSpy()
              feature.disable('f1')
              feature.whenDisabled('f2', spy)
              expect(spy).toNotHaveBeenCalled()
            })
          })
        })
      })

      describe('2 successions', () => {
        describe('2 .whenDisabled() calls', () => {
          describe('.whenDisabled() -> .whenDisabled() -> .disable()', () => {
            describe('.whenDisabled(f1) -> .whenDisabled(f2) -> .disable(f1)', () => {
              it('invokes the subscriber for f1 but not for f2', () => {
                const spyOne = expect.createSpy()
                const spyTwo = expect.createSpy()
                feature.whenDisabled('f1', spyOne)
                feature.whenDisabled('f2', spyTwo)
                feature.disable('f1')
                expect(spyOne).toHaveBeenCalled()
                expect(spyTwo).toNotHaveBeenCalled()
              })
            })

            describe('.whenDisabled(f1) -> .whenDisabled(f1) -> .disable(f1)', () => {
              it('invokes both subscribers for f1', () => {
                const spyOne = expect.createSpy()
                const spyTwo = expect.createSpy()
                feature.whenDisabled('f1', spyOne)
                feature.whenDisabled('f1', spyTwo)
                feature.disable('f1')
                expect(spyOne).toHaveBeenCalled()
                expect(spyTwo).toHaveBeenCalled()
              })
            })
          })

          describe('.disable() -> .whenDisabled() -> .whenDisabled()', () => {
            describe('.disable(f1) -> .whenDisabled(f2) -> .whenDisabled(f1)', () => {
              it('invokes the subscriber for f1 but not for f2', () => {
                const spyOne = expect.createSpy()
                const spyTwo = expect.createSpy()
                feature.disable('f1')
                feature.whenDisabled('f2', spyOne)
                feature.whenDisabled('f1', spyTwo)
                expect(spyOne).toNotHaveBeenCalled()
                expect(spyTwo).toHaveBeenCalled()
              })
            })

            describe('.disable(f1) -> .whenDisabled(f1) -> .whenDisabled(f1)', () => {
              it('invokes both subscribers for f1', () => {
                const spyOne = expect.createSpy()
                const spyTwo = expect.createSpy()
                feature.disable('feature-name')
                feature.whenDisabled('feature-name', spyOne)
                feature.whenDisabled('feature-name', spyTwo)
                expect(spyOne).toHaveBeenCalled()
                expect(spyTwo).toHaveBeenCalled()
              })
            })
          })
        })

        describe('2 .disable() calls', () => {
          describe('.disable() -> .disable() -> .whenDisabled()', () => {
            describe('.disable(f1) -> .disable(f2) -> .whenDisabled(f1)', () => {
              it('invokes the subscriber for f1', () => {
                const spy = expect.createSpy()
                feature.disable('f1')
                feature.disable('f2')
                feature.whenDisabled('f1', spy)
                expect(spy).toHaveBeenCalled()
              })
            })
          })

          describe('.whenDisabled() -> .disable() -> .disable()', () => {
            describe('.whenDisabled(f1) -> .disable(f1) -> .disable(f1)', () => {
              it('invokes the subscriber only once', () => {
                const spy = expect.createSpy()
                feature.whenDisabled('f1', spy)
                feature.disable('f1')
                spy.reset()
                feature.disable('f1')
                expect(spy).toNotHaveBeenCalled()
              })
            })
          })
        })
      })
    })
  })
})
