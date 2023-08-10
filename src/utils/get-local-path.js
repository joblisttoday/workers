export default (url = import.meta.url, pathDepth = 0) => {
	const moduleUrlPaths = url.split("/");
	const moduleUrl = moduleUrlPaths
		.slice(0, moduleUrlPaths.length - pathDepth)
		.join("/");
	return moduleUrl
}
