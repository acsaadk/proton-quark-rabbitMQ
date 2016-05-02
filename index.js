'use strict'

const fs = require('fs')
const path = require('path')
const Quark = require('proton-quark')
const PubSub = require('amqplib-pubsub')
const _ = require('lodash')

class AmqpPubSubQuark extends Quark {

  constructor(proton) {
    super(proton)
    this.tx = null
    this.rx = null
  }

  validate() {
    const configs = this.proton.app.config.rabbit || {}
    this.tx = process.env.RABBIT_URL_TX || process.env.RABBIT_URL || configs.urlTx || configs.url
    this.rx = process.env.RABBIT_URL_RX || process.env.RABBIT_URL || configs.urlRx || configs.url

    if (!this.tx) throw new Error('Environment variable or config file for url tx is missing.')
    if (!this.rx) throw new Error('Environment variable or config file for url rx is missing.')
  }

  configure() {
    if (!this.proton.app.queueControllers) this.proton.app.queueControllers = {}
  }

  initialize() {
    this.pubSub = new PubSub()
    this.pubSub.connectForRx(this.tx).connectForTx(this.rx)
    global.pubSub = this.pubSub
    global.Queue = require('./queue')
    this._loadControllers()
    this._subscribeQueues()
  }

  _loadControllers() {
    _.forEach(this.controllers, (Controller, fileName) => {
      const ctrl = new Controller(this.proton)
      ctrl.fileName = fileName
      ctrl.expose()
      this.proton.app.queueControllers[ctrl.name] = ctrl
      return ctrl
    })
  }

  _subscribeQueues() {
    _.forEach(this._queues, queue => {
      queue.subscribers.map(q => this.pubSub.subscribe(q.name, q.cb))
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

module.exports = AmqpPubSubQuark
