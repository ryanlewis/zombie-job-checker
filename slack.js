const moment = require('moment')
const IncomingWebhook = require('@slack/client').IncomingWebhook

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)

module.exports = function notifySlack(msg) {
  return new Promise((resolve, reject) => {
    webhook.send(`msg`, (err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  })
}