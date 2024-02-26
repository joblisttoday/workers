import database from "../databases/database-git.js";

const init = async () => {
	await database.cloneDatabase();
};

init();

export default init;
