const glob = require('glob');

export function getFilesFromFolder(src, extension = '') {
	return new Promise((resolve, reject) => {
		const parsedSrc = `${src}/**/*${extension ? `${extension}` : ''}`;
		glob(parsedSrc, (err, files) => err ? reject(err) : resolve(files));
	})
}
