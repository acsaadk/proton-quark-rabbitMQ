'use strict'

class Queue {
  constructor() {
    this.subscribers = []
  }

  subscribe(name, cb) {
    this.subscribers.push({name, cb})
  }
}

module.exports = Queue
