const sql = require('mssql')
const moment = require('moment')
const slack = require('./slack')

require("console-stamp")(console)

const doCheck = async () => {
  const username = process.env.DB_USERNAME
  const password = process.env.DB_PASSWORD
  const server = process.env.DB_SERVER
  const database = process.env.DB_DATABASE;

  let pool

  try {
    const config = {
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      options: {
        encrypt: true
      }
    }

    console.log('Connecting to database...')
    pool = await sql.connect(config)
    console.log('Connected')

    const result = await pool.request()
      .query(`select top 1 CompletedAt from IEA.Jobs
        where origin = 0 and CompletedAt is not null
        order by CompletedAt desc`)

    const completedAt = result.recordset[0].CompletedAt

    const d = moment(completedAt)
    const compare = moment().subtract(10, 'minutes')

    if (d.isBefore(compare)) {
      const msg = `Potentially have a stuck 'Zombie' job. Last completed a job ${d.fromNow()}`
      console.log(msg)
      await slack(msg)
    } else {
      console.log(`OK - Last job completed ${d.fromNow()}`)
    }
  } catch (err) {
    // ... error checks
    console.log(err)
  } finally {
    console.log('Closing connection...')
    if (pool) pool.close()
    sql.close()
    console.log('Complete')
  }
}

(async function() {
  setInterval(doCheck, 60 * 1000)
  await doCheck()
})()
