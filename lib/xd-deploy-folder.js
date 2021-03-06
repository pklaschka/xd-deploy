/*
 * Copyright (c) 2020. by Pablo Klaschka
 */

/**
 * @module {string} xd-deploy-folder
 * Sets up folder structure for xd-deploy and exports path to the main folder
 */

/**
 * @type {module:fs}
 */
const fs = require('fs');
const path = require('path');

/**
 * The base folder for app files
 * @type {string}
 */
const xdDeployFolder = path.join(require('os').homedir(), '.xd-deploy');

// Create folder if they don't exit:
if (!fs.existsSync(xdDeployFolder)) {
    fs.mkdirSync(xdDeployFolder);
}

if (!fs.existsSync(path.join(xdDeployFolder, 'server'))) {
    fs.mkdirSync(path.join(xdDeployFolder, 'server'));
}

if (!fs.existsSync(path.join(xdDeployFolder, 'client'))) {
    fs.mkdirSync(path.join(xdDeployFolder, 'client'));
}

module.exports = xdDeployFolder;
