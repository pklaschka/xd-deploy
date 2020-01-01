/*
 * Copyright (c) 2020. by Pablo Klaschka
 */

const path = require('path');

/**
 * The temporary location for Zip files that get downloaded.
 * @type {string}
 */
const zipLocation = path.join(__dirname, './current.zip');

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
    win: path.join(home, 'AppData', 'Local', 'Packages', 'Adobe.CC.XD_adky2gkssdxte', 'LocalState'),
    mac: path.join(home, 'Library', 'Application Support', 'Adobe', 'Adobe XD'),
    linux: path.join(home, 'xd-plugins-emulated'),
};

/**
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
