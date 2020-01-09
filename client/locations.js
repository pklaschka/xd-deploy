/*
 * Copyright (c) 2020. by Pablo Klaschka
 */
require('fs');
const path = require('path');

/**
 * The folder where the client puts the temporary zip files
 * @type {string}
 */
const zipFolder = path.join(require('../lib/xd-deploy-folder'), 'client');

/**
 * The temporary location for Zip files that get downloaded.
 * @type {string}
 */
const zipLocation = path.join(zipFolder, 'current.zip');

/**
 * The user's home directory path
 * @type {string}
 */
const home = require('os').homedir();

/**
 * The develop folder locations, depending on the user's os
 * @type {Object<string,string>}
 */
const locations = {
    /**
     * Folder for Windows
     */
    win32: path.join(home, 'AppData', 'Local', 'Packages', 'Adobe.CC.XD_adky2gkssdxte', 'LocalState', 'develop'),
    /**
     * Folder for macOS
     */
    darwin: path.join(home, 'Library', 'Application Support', 'Adobe', 'Adobe XD', 'develop'),
    /**
     * Emulated folder for Linux (for testing purposes only!)
     */
    linux: path.join(home, 'xd-plugins-emulated'),
};

/**
 * The operating system te user is on right now
 * @type {string}
 */
const os = require('os').platform().toString();

if (!locations.hasOwnProperty(os))
    throw new Error('Unsupported os detected: ' + os);
/**
 * The user's develop folder location, based on his/her os
 */
const xdPluginFolderLocation = locations[os];

module.exports = { xdPluginFolderLocation, zipLocation };
