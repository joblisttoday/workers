import jsdom from "jsdom";
const { JSDOM } = jsdom;

/*
	 this is a dependency for npm:joblist/job-board-providers
	 for provider parser `personio`
 */

global.window = new JSDOM().window;
global.document = new JSDOM().window.document;
global.HTMLElement = new JSDOM().window.HTMLElement;
global.customElements = new JSDOM().window.customElements;
global.DOMParser = new JSDOM().window.DOMParser;
