const recruitee = require('./providers/recruitee')
const greenhouse = require('./providers/greenhouse')

const recruiteeHost = 'idealocareer'
const greenhouseHost = 'fulfillment'

/* recruitee.getJobs({hostname: recruiteeHost}).then(jobs => {
 * 	console.log('recruitee jobs', jobs)
 * }) */

greenhouse.getJobs({hostname: greenhouseHost}).then(jobs => {
	console.log('greenhouse jobs', jobs)
})
