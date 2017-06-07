global.Promise = require("bluebird");
const { cd } = require('shelljs');
const { storage } = require('google-cloud');
const { tar, bzip2, aesEncrypt, log, makeRandomFolder, cleanRandomFolders } = require('./util');

// MAIN CODE

module.exports = async function (config) {
	if(!config) return console.error("Nothing to do");
	else if(!config.writerKeyFile) return console.error(config.name, "Missing writer configuration");
	else if(typeof config.backupHandler !== 'function') return console.error(config.name, "Missing handler in configuration");

	const key = require(config.writerKeyFile);
	const tmpDir = makeRandomFolder();
	log(`The working folder is ${tmpDir}`);

	const gcs = storage({
		projectId: key.project_id,
		keyFilename: config.writerKeyFile,
		promise: global.Promise
	});
	const bucket = gcs.bucket(config.bucket);


	log("STARTING BACKUP", key.project_id, config.name);

	// PREPARE
	config.backupHandler({ tmpDir });

	// PACKAGE
	cd(tmpDir);
	log("PACKAGING");
	const dateSuffix = new Date().toJSON().replace(/:/g, '-').replace(/\.[0-9]{3}Z$/, '');
	const tarFile = tar(".", `backup-${config.name}-${dateSuffix}.tar`);

	log("COMPRESSING", tarFile);
	const bzipFile = bzip2(tarFile);

	var uploadedFile;
	if (config.aesKey) {
		log("ENCRYPTING", bzipFile);
		uploadedFile = bzipFile + ".aes";
		aesEncrypt(bzipFile, uploadedFile, config.aesKey);
	}
	else {
		uploadedFile = bzipFile;
	}

	// UPLOAD
	log("UPLOADING", tmpDir + "/" + uploadedFile);
	const destination = config.bucketFolder ? `${config.bucketFolder}/${uploadedFile}` : uploadedFile;
	const data = await bucket.upload(tmpDir + "/" + uploadedFile, { destination });
	var file = data[0];

	if (file && file.metadata && file.metadata.selfLink) {
		log("DONE", file && file.metadata && file.metadata.selfLink);
	}
	else {
		log("Could not complete the operation", file);
	}
	cleanRandomFolders();
}
