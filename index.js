const recruitee = require('./providers/recruitee')
const greenhouse = require('./providers/greenhouse')
const smartrecruiters = require('./providers/smartrecruiters')

const city = 'berlin'

const recruiteeHost = 'idealocareer'
const greenhouseHost = 'fulfillment'
const smartrecruitersHost = 'smartrecruiters'

/* recruitee.getJobs({hostname: recruiteeHost}).then(jobs => {
 * 	console.log('recruitee jobs', jobs)
 * }) */

/* greenhouse.getJobs({hostname: greenhouseHost}).then(jobs => {
 *  	console.log('greenhouse jobs', jobs)
 * }) */

smartrecruiters.getJobs({
	hostname: smartrecruitersHost,
	city: city
}).then(jobs => {
	console.log('smartrecruiters jobs', jobs)
})
