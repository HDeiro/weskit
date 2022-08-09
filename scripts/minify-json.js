const fs = require('fs')
const { getFilesFromFolder } = require('./utils/files');

const src = './dist';

(async () => {
	console.log(`Starting the uglification of all JSON files in ${src}`);
	const files = await getFilesFromFolder(src, '.json');
	await Promise.all(files.map(minifyJson));
	console.log(`Finished the uglification of all JSON files in ${src}`);
})();

async function minifyJson(filePath) {
	return new Promise(resolve => {
		const data = fs.readFileSync(filePath, { encoding:'utf8', flag:'r' });
		const minifiedContent = JSON.stringify(JSON.parse(data));
		fs.writeFileSync(filePath, minifiedContent);
		console.log(`\t Uglified ${filePath}`);
		resolve();
	})
}
