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
      throw new Error("AMQP URL for transmition is missing")
    }
    if(!RX) {
      throw new Error("AMQP URL for reception is missing")
    }
  }

  initialize(){
    const pubsub = new PubSub()
    global.pubSub = pubsub.connectForRx(RX).connectForTx(TX)
  }

}

module.exports = AmqpPubSubQuark;
