import jsdom  from 'jsdom'
const { JSDOM } = jsdom

/*
	 this is a dependency for npm:joblist/job-board-providers
	 for provider parser `personio`
 */

global.DOMParser = new JSDOM().window.DOMParser
