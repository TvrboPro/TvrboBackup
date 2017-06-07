const { cd, cp, exec } = require('shelljs');
const { existsSync } = require('fs');
const { log } = require('../lib/util');

// PUT YOUR SETTINGS BELOW AND EXPORT THEM

const dbConfig = {
	name: "db-weekly",

	bucket: "tvrbo-back-dora-black",
	bucketFolder: "mongodb-backup",  // optional
	backupCopies: 10,   // for rotation
	// aesKey: "1234",  // optional encryption

	// rotatorKeyFile: __dirname + '/gcloud-rotate.json',
	writerKeyFile: __dirname + '/gcloud-write.json',

	backupHandler: function ({ tmpDir }) {
		cd(tmpDir);

		log("DUMPING THE DATABASE");

		const dbName = 'dorablack';
		exec(`mongodump --db ${dbName}`);
	}
};

const mediaConfig = {
	name: "media-monthly",

	bucket: "tvrbo-back-dora-black",
	bucketFolder: "media-backup",  // optional
	backupCopies: 3,   // for rotation
	// aesKey: "1234",  // optional encryption

	// rotatorKeyFile: __dirname + '/gcloud-rotate.json',
	writerKeyFile: __dirname + '/gcloud-write.json',

	backupHandler: function ({ tmpDir }) {
		const folder = '/var/assets';
		if(!existsSync(folder)) return;

		cd(tmpDir);

		log("COPYING STATIC ASSETS");

		cp('-R', folder, tmpDir);
	}
};

// EXPORT

module.exports = [
	dbConfig,
	mediaConfig
];
