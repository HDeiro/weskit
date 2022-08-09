const fs = require('fs')
const { resolve } = require('path');

const FOLDER_TO_BE_MINIFIED = './dist';

async function* getFiles(directory) {
	const dirents = await fs.promises.readdir(directory, { withFileTypes: true });

	for (const dirent of dirents) {
		const path = resolve(directory, dirent.name);

		if (dirent.isDirectory()) {
			yield* getFiles(path);
		} else {
			yield path;
		}
	}
}

async function minifyJson(filePath) {
	const data = fs.readFileSync(filePath, { encoding:'utf8', flag:'r' });
	const minifiedContent = JSON.stringify(JSON.parse(data));
	fs.writeFileSync(filePath, minifiedContent);
}

(async () => {
	console.log(`Starting the uglification of all JSON files in ${FOLDER_TO_BE_MINIFIED}`);

	for await (const filePath of getFiles(FOLDER_TO_BE_MINIFIED)) {
		if (!filePath.endsWith('.json')) continue;
		await minifyJson(filePath);
		console.log(`\t Uglified ${filePath}`);
	}

	console.log(`Finished the uglification of all JSON files in ${FOLDER_TO_BE_MINIFIED}`);
})()
