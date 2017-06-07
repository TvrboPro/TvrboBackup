#!/usr/bin/env node

const config = require('./config');
const command = process.argv[2];
const param = process.argv[3];
const doBackup = require('./lib/backup');
const doRotation = require('./lib/rotate');

switch(command){
    case 'backup':
        backup();
        break;
    case 'rotate':
        rotate();
        break;
    default:
        console.error("Invalid parameter");
        process.exit(1);
}

async function backup(){
	var actions = config;
	if(param) {
		actions = config.filter(c => c.name == param);
		if(!actions.length){
			console.log("There is no backup configuration with this name");
			return
		}
	}
	else console.log("Running all backup configurations");

	await Promise.map(actions, action => doBackup(action));
}

async function rotate(){
	var actions = config;
	if(param) {
		actions = config.filter(c => c.name == param);
		if(!actions.length){
			console.log("There is no backup configuration with this name");
			return
		}
	}
	else console.log("Running all backup configurations");

	await Promise.map(actions, action => doRotation(action));
}
