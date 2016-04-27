const Quark = require('../index')
const should = require('should')

describe('PubSub quark test', () => {

  it('should expose pubSub object and Queue class globally', done => {
    const app = {
      path: '',
      config: {
        rabbit: {}
      }
    }
    const quark = new Quark({app})
    quark.validate()
    quark.configure()
    quark.initialize()
    global.should.have.property('pubSub')
    global.should.have.property('Queue')
    done()
  })

  it('should subscribe to a specific queue', done => {
    pubSub.subscribe('test_queue')
    .then(msg => {
      console.log(msg.content)
      done()
    })
    .catch(err => {
      done(err)
    })
  })

  it('should publish to a specific queue', done => {
    pubSub.publish('test_queue', {
      id: 1234,
      desc: "Hello from Test Queue"
    })
    .then(result => {
      done()
    })
    .catch(err => {
      done(err)
    })
  })
})
