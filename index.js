'use strict'

const fs = require('fs')
const path = require('path')
const Quark = require('proton-quark')
const Pubsub = require('amqplib-pubsub')
const _ = require('lodash')

module.exports = class RabbitmqQuark extends Quark {
  constructor(proton) {
    super(proton)
    this.tx = null
    this.rx = null
  }

    /**
     * @method validate
     * @description
     * @author Carlos Marcano
     */
  validate() {
    const configs = this.proton.app.config.rabbitmq || {}
    this.tx = process.env.RABBIT_URL_TX || process.env.RABBIT_URL || configs.urlTx || configs.url
    this.rx = process.env.RABBIT_URL_RX || process.env.RABBIT_URL || configs.urlRx || configs.url

    if (!this.tx) throw new Error('Environment variable or config file for url tx is missing.')
    if (!this.rx) throw new Error('Environment variable or config file for url rx is missing.')
  }

  /**
   * @method configure
   * @description
   * @author Carlos Marcano
   */
  configure() {
    if (!this.proton.app.queueControllers) this.proton.app.queueControllers = {}
  }

  /**
   * @method initialize
   * @description
   * @author Carlos Marcano
   */
  initialize() {
    this.pubsub = new Pubsub()
    this.pubsub.connectForRx(this.tx).connectForTx(this.rx)
    this._loadControllers()
    this._subscribeQueues()
    proton.app.rabbitmq = { pubsub: this.pubsub }
  }

  /**
   *
   *
   */
  _loadControllers() {
    _.forEach(this._controllers, (Controller) => {
      const ctrl = new Controller(this.proton)
      this.proton.app.queueControllers[ctrl.name] = ctrl
    })
  }

  /**
   *
   *
   */
  _subscribeQueues() {
    _.forEach(this._queues, queue => {
      queue.subscribers.map(q => this.pubsub.subscribe(q.name, q.cb))
    })
  }

  get _queues() {
    const queuesPath = path.join(this.proton.app.path, '/queues')
    return fs.existsSync(queuesPath) ? require('require-all')(queuesPath) : {}
  }

  get _controllers() {
    const controllersPath = path.join(this.proton.app.path, '/queue-controllers')
    return fs.existsSync(controllersPath) ? require('require-all')(controllersPath) : {}
  }
}
