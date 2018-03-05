
/**
 * 消息推送
 * options 客户端个推推送的所有消息
 */

import _isArray from 'lodash/isArray'

const globalEvent = weex.requireModule('globalEvent')
const storage = weex.requireModule('bmStorage')
const router = weex.requireModule('bmRouter')
const modal = weex.requireModule('bmModal')

const Mixins = Object.create(null)
const GLOBAL_EVENTS = Object.create(null)

class EventsMaker {
    constructor(events) {
        events && events.length && events.map(event => {
            this[`${event}Maker`]()
        })
    }
    pushMessageMaker() {
        globalEvent.addEventListener('pushMessage', (options) => {
            _isArray(GLOBAL_EVENTS['pushMessage']) && GLOBAL_EVENTS['pushMessage'].map((item) => {
                item(options)
            })
        })
    }
    beforeAppearMaker() {
        globalEvent.addEventListener('viewWillAppear', (options) => {
            if (options.type === 'open' || options.type === 'refresh') {
                router.getParams((params) => {
                    _isArray(GLOBAL_EVENTS['beforeAppear']) &&GLOBAL_EVENTS['beforeAppear'].map((item) => {
                        item(params, options)
                    })
                })
            } else if (options.type === 'back') {
                storage.getData('router.backParams', ({ status, errorMsg, data }) => {
                    const result = status === 0 ? JSON.parse(data) : ''
                    _isArray(GLOBAL_EVENTS['beforeBackAppear']) &&GLOBAL_EVENTS['beforeBackAppear'].map((item) => {
                        item(result, options)
                    })
                })
            }
        })
    }
    beforeBackAppearMaker() {
       this.beforeAppearMaker()
    }
    appearedMaker() {
        globalEvent.addEventListener('viewDidAppear', (options) => {
            if (options.type === 'open' || options.type === 'refresh') {
                router.getParams((params) => {
                    _isArray(GLOBAL_EVENTS['appeared']) &&GLOBAL_EVENTS['appeared'].map((item) => {
                        item(params, options)
                    })
                })
            } else if (options.type === 'back') {
                storage.getData('router.backParams', ({ status, errorMsg, data }) => {
                    const result = status === 0 ? JSON.parse(data) : ''
                    _isArray(GLOBAL_EVENTS['backAppeared']) &&GLOBAL_EVENTS['backAppeared'].map((item) => {
                        item(result, options)
                    })
                    storage.deleteData('router.backParams')
                })
            }
        })
    }
    backAppearedMaker() {
        this.appearedMaker()
    }
    beforeDisappearMaker() {
        globalEvent.addEventListener('viewWillDisappear', (options) => {
            modal.hideLoading()
            _isArray(GLOBAL_EVENTS['beforeDisappear']) && GLOBAL_EVENTS['beforeDisappear'].map((item) => {
                item(options)
            })
        })
    }
    disappearedMaker() {
        globalEvent.addEventListener('viewDidDisappear', (options) => {
            _isArray(GLOBAL_EVENTS['disappeared']) &&GLOBAL_EVENTS['disappeared'].map((item) => {
                item(options)
            })
        })
    }
    appDeactiveMaker() {
        globalEvent.addEventListener('appDeactive', (options) => {
            _isArray(GLOBAL_EVENTS['appDeactive']) && GLOBAL_EVENTS['appDeactive'].map((item) => {
                item(options)
            })
        })
    }
    appActiveMaker() {
        globalEvent.addEventListener('appActive', (options) => {
            _isArray(GLOBAL_EVENTS['appActive']) && GLOBAL_EVENTS['appActive'].map((item) => {
                item(options)
            })
        })
    }
}

Mixins.install = (Vue, options) => {
    Vue.mixin({
        beforeCreate () {
            if (!this.$options.eros) return
            const erosEvents = this.$options.eros
            const erosEventsMap = Object.keys(this.$options.eros)
            new EventsMaker(erosEventsMap)
            erosEventsMap.map(event => {
                if (!GLOBAL_EVENTS[event]) GLOBAL_EVENTS[event] = []
                GLOBAL_EVENTS[event].push(erosEvents[event].bind(this))
            })
        }
    })
}

Vue.use(Mixins)
