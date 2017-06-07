const { exec , rm, mkdir } = require('shelljs');
const { existsSync } = require('fs');
const { extname, basename } = require('path');

// PACKAGING / ENCRYPTION

function tar(inFiles, outFile) {
    if(typeof(inFiles) == "object")
        exec(`tar cvf ${outFile} ${inFiles.join(' ')}`);
    else
        exec(`tar cvf ${outFile} ${inFiles}`);

    return outFile;
}

function unTar(inFile) {
    exec(`tar xvf ${inFile}`);
    return inFile;
}

function bzip2(file) {
    exec(`bzip2 -z -f -v --best ${file}`);
    return file + ".bz2";
}

function bunzip2(file) {
    const ext = extname(file);
    const newpath = basename(file, ext);
    exec(`bunzip2 ${file}`);
    return newpath;
}

function aesEncrypt(inFile, outFile, pass) {
    exec(`openssl enc -e -aes-256-cbc -pass pass:${pass} -in ${inFile} -out ${outFile}`);
    return outFile;
}

function aesDecrypt(inFile, outFile, pass) {
    exec(`openssl enc -d -aes-256-cbc -pass pass:${pass} -in ${inFile} -out ${outFile}`);
    return outFile;
}

// TEMP STORAGE

var deletionPending = [];

function cleanRandomFolders() {
    deletionPending.forEach(path => {
        console.log("Clean up: removing path [" + path + "]");
        rm("-Rf", path);
    });
}

function makeRandomFolder() {
  var outPath;
  const sysTmpPath = process.env.TMPDIR ||
      process.env.TMP ||
      process.env.TEMP ||
      (process.platform === "win32" ? "c:\\windows\\temp\\" : "/tmp/")

  do {
    outPath = Date.now() + Math.random() + '';
  } while(existsSync(sysTmpPath + outPath));

  mkdir('-p', sysTmpPath + outPath);
  deletionPending.push(sysTmpPath + outPath);

  return sysTmpPath + outPath;
}

function log(...args) {
    console.log("\n" + new Date().toJSON());
		console.log(...args, "\n");
}

module.exports = {
    aesEncrypt,
    aesDecrypt,
    tar,
    unTar,
    bzip2,
    bunzip2,
    cleanRandomFolders,
    makeRandomFolder,
    log
};
