/*
 * Copyright (c) 2020. by Pablo Klaschka
 */

const {zipLocation, xdPluginFolderLocation} = require('./locations');

const {default: axiosLib} = require('axios'); // import style for tsc --checkJS, cf. https://github.com/axios/axios/issues/2145
const axios = axiosLib.create({
    httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false
    })
});
const fs = require('fs');
const extract = require('extract-zip');
const rrmdir = require('../lib/rmdir');
const path = require('path');

module.exports = applyUpdate;

/**
 * Extract the plugin to the plugin folder. Override when neccessary
 * @param {string} id The plugin-id
 */
function extractToPluginFolder(id) {
    // Extract zip file
    if (fs.existsSync(path.join(xdPluginFolderLocation, id)))
        rrmdir(path.join(xdPluginFolderLocation, id));

    if (!fs.existsSync(xdPluginFolderLocation)) {
        throw new Error('Adobe XD Plugins directory does not exist. Expected ' + xdPluginFolderLocation + ' to exist.');
    } else {
        extract(zipLocation, {dir: xdPluginFolderLocation}, () => {
            console.log('> Extraction completed.');
        });
    }
}

/**
 * Fetches a plugin from the server
 * @param {string} id The plugin id
 * @param {string} serverLocation The location of the server
 * @returns {Promise<import('axios').AxiosResponse<*>>}
 */
async function fetchPluginZip(id, serverLocation) {
    return await axios.get(`${serverLocation}/download/${id}`, {
        responseType: 'stream'
    });
}

/**
 * Installs an update
 * @param {Object} params
 * @param {string} params.id The plugin id
 * @param {string} serverLocation The location of the server
 * @returns {Promise<void>}
 */
async function applyUpdate({id}, serverLocation) {
    console.log('Updating plugin with id', id);
    // download zip
    console.log('> Downloading plugin');

    if (fs.existsSync(zipLocation))
        fs.unlinkSync(zipLocation);

    const writer = fs.createWriteStream(zipLocation);

    try {
        const zip = await fetchPluginZip(id, serverLocation);
        console.log(`> Download complete. Extracting to ${xdPluginFolderLocation}`);
        writer.on('finish', () => {
            extractToPluginFolder(id);
        });
        zip.data.pipe(writer);
    } catch (e) {
        console.warn(e.message);
        if (e.response.status === 404) {
            console.warn('> Server returned 404, ignoring change notification');
        }
    }
}
