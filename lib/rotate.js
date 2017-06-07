global.Promise = require("bluebird");
const { storage } = require('google-cloud');
const { log } = require('./util');

module.exports = async function (config) {
	if (!config) return console.error("Nothing to do");
	else if (!config.rotatorKeyFile) return console.error(config.name, "Missing rotator configuration");

	try {
		const key = require(config.rotatorKeyFile);
		const gcs = storage({
			projectId: key.project_id,
			keyFilename: config.rotatorKeyFile,
			promise: global.Promise
		});
		const bucket = gcs.bucket(config.bucket);

		log("STARTING BACKUPS ROTATION", key.project_id, config.name);

		var files = await listAllFiles(bucket, config.bucketFolder);

		log(`GOT ${files.length} FILES`);

		if (!files || files.length < config.backupCopies) return;

		files = files.sort((file1, file2) => file2.metadata.timeCreated.localeCompare(file1.metadata.timeCreated));
		files = files.filter(file => parseInt(file.metadata.size) > 0)

		const cleanable = files.slice(config.backupCopies);

		log(`KEEPING THE NEWEST ${config.backupCopies}`);
		log(`CLEANING THE OLDEST ${cleanable.length}`);
		await Promise.map(cleanable, file => {
			log('Cleaning', file.name);
			return bucket.file(file.name).delete();
		})

		log("DONE", key.project_id, config.name);
	}
	catch (err) {
		log("ERROR: UNABLE TO ROTATE", err);
	}
}

// AUX

function listAllFiles(bucket, prefix) {
	return new Promise((resolve, reject) => {
		var list = [];

		function readResponse(err, files, nextQuery, apiResponse) {
			if (err) return reject(err);
			list = list.concat(files);
			if (nextQuery) bucket.getFiles(nextQuery, readResponse);
			else resolve(list);
		}

		bucket.getFiles({
			maxResults: 50,
			prefix: prefix
		}, readResponse);
	});
}
