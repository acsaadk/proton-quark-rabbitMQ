'use strict'

const Quark = require('proton-quark');
const PubSub = require('./pubsub');

const TX = process.env.AMQP_URL_TX || process.env.AMQP_URL || null
const RX = process.env.AMQP_URL_RX || process.env.AMQP_URL || null

class AmqpPubSubQuark extends Quark {

  constructor(proton){
    super(proton)
  }

  validate(){
    if(!TX) {
      throw new Error("MQP_URL_TX environment variable is missing. You can also set AMQP_URL for both tx and rx")
    }
    if(!RX) {
      throw new Error("AMQP_URL_RX environment variable is missing. You can also set AMQP_URL for both tx and rx")
    }
  }

  initialize(){
    const pubsub = new PubSub()
    global.pubSub = pubsub.connectForRx(RX).connectForTx(TX)
  }

}

module.exports = AmqpPubSubQuark;
