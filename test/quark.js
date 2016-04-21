const PubSub = require('../pubsub');
const should = require('should');

const URL = 'amqp://MWrhIIqz:F0b_qvFT5JURJgbcylnz7rQqYlZJrkWo@hiding-threarah-45.bigwig.lshift.net:11043/_g_VaWPW3DRC';

describe('PubSub class test', () => {

  const pubsub = new PubSub()
  pubsub.connect(URL)

  // Consumer
  it('should subscribe to a specific queue', done => {
    pubsub
    .subscribe('test_queue')
    .then(msg => {
      console.log(msg.content)
      done()
    })
    .catch(err => {
      done(err)
    })
  })

  // Publisher
  it('should publish a message to a specific queue', done => {
    pubsub
    .publish('test_queue', {id: 2435, desc: 'This is a test message published in test_queue'})
    .then(result => {
      console.log(result)
      done()
    })
  })
})
