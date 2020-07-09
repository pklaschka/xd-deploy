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
const {error} = require("../lib/error-handler");
const {log} = require("../lib/error-handler");

module.exports = applyUpdate;

/**
 * Extract the plugin to the plugin folder. Override when necessary
 * @param {string} id The plugin-id
 * @returns {Promise<void>} Promise
 */
async function extractToPluginFolder(id) {
        // Extract zip file
        if (fs.existsSync(path.join(xdPluginFolderLocation, id)))
            rrmdir(path.join(xdPluginFolderLocation, id));

        if (!fs.existsSync(xdPluginFolderLocation)) {
            throw new Error('Adobe XD Plugins directory does not exist. Expected ' + xdPluginFolderLocation + ' to exist.');
        } else {
            return extract(zipLocation, {dir: xdPluginFolderLocation});
        }
}

/**
 * Fetches a plugin from the server and saves it in the `location`
 * @param {string} id The plugin id
 * @param {string} serverLocation The location of the server
 * @param {string} location the location of the zip file
 * @returns {Promise<import('axios').AxiosResponse<*>>}
 */
async function fetchPluginZip(id, serverLocation, location) {
    return new Promise(async (resolve, reject) => {
        try {
            const zip = await axios.get(`${serverLocation}/download/${id}`, {
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(location);
            writer.on('finish', () => {
                resolve();
            });
            writer.on('error', reject);
            zip.data.pipe(writer);
        } catch (e) {
            return reject(e);
        }
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
    log('Updating plugin with id', id);
    // download zip
    log('> Downloading plugin');

    if (fs.existsSync(zipLocation))
        fs.unlinkSync(zipLocation);


    try {
        await fetchPluginZip(id, serverLocation, zipLocation);
        log(`> Download complete. Extracting to ${xdPluginFolderLocation}`);
        await extractToPluginFolder(id);
        log('> Extraction completed.');
    } catch (e) {
        error(e);
        if (e.response.status === 404) {
            log('> Server returned 404, ignoring change notification');
        }
    }
}
