'use strict'

const amqplib = require('amqplib');

class PubSub {

  constructor(){
    this._rx = null;
    this._tx = null;
  }

  connect(url){
    return this.connectForRx(url).connectForTx(this._rx)
  }

  connectForRx(url){
    this._rx = (typeof url === 'string') ? amqplib.connect(url) : url
    return this
  }

  connectForTx(url){
    this._tx = (typeof url === 'string') ? amqplib.connect(url) : url
    return this
  }

  /**
   * @method publish
   * @description Publish a message to a specific queue
   * @author Antonio Saad
   */
  publish(queue, msg, opts){
    if(this._tx === null) throw new Error("No connection available for publishing")
    return this._tx.then(conn => conn.createChannel())
    .then(channel => [channel, channel.assertQueue(queue)])
    .then(results => results[0].sendToQueue(queue, new Buffer(JSON.stringify({data: msg})), opts)) // results[0] is the channel
  }

  subscribe(queue, opts, noAck){
    if(this._rx === null) throw new Error("No connection available for consuming")
    return this._rx.then(conn => conn.createChannel())
    .then(channel => Promise.all([channel, channel.assertQueue(queue)]))
    .then(results => {
      const channel = results[0]
      return new Promise((resolve, reject) => {
        channel.consume(queue, msg => {
          if(!noAck) channel.ack(msg)
          msg.content = JSON.parse(msg.content.toString()).data
          return (msg) ? resolve(msg) : reject(new Error("Message is null"))
        }, opts)
      })
    })
  }
}

module.exports = PubSub;
