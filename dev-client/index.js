const fs = require('fs');
const path = require('path');
const zip = require('../lib/zip');
const axios = require('axios');
const chokidar = require('chokidar');

/**
 * Run the developer client
 * @param {'watch' | 'install'} action The action that should get performed.
 * @param {string} serverLocation The server location, e.g., http://localhost:8080
 * @param {string} [location='.'] The plugin folder location.
 * @throws {Error} When not inside a plugin folder
 */
module.exports = async function(action, serverLocation, location = '.') {
    if (!isPluginFolder(location)) {
        throw new Error('Not inside a plugin folder');
    }

    if (action === 'watch') {
        const watcher = chokidar.watch(location, {
            persistent: true,
            interval: 1000
        });

        const onUpdate = async () => {
            await send(serverLocation, location);
        };

        watcher.on('all', async () => await onUpdate());
    } else if (action === 'install') {
        await send(serverLocation, location);
    } else {
        throw new Error('Unknown action: ' + action)
    }
};

/**
 * Send the current version to the server
 * @param {string} serverLocation The server location
 * @param {string} localLocation The local plugin location
 * @throws {Error} When not inside a plugin folder or the server location is not specified
 */
async function send(serverLocation, localLocation) {
    if (!serverLocation)
        throw new Error('Server location not specified');
    const id = getId(localLocation);
    const zipLocation = path.join(__dirname, `${id}.zip`);
    console.info('Sending plugin', id);

    await zip(localLocation, zipLocation);
    await axios.post(serverLocation + '/post/' + id,
        fs.readFileSync(zipLocation), {
        headers: {'Content-Type': 'application/zip'}
        }
    );

    // fs.unlinkSync(zipLocation);

    console.info('Sent successfully');
}

/**
 * Get the id of the current plugin
 * @param location The local plugin location
 * @returns {string} The id of the plugin
 * @throws {Error} When not inside a plugin folder
 */
function getId(location) {
    if (!isPluginFolder(location))
        throw new Error('Not inside a plugin folder');
    else {
        const manifest = JSON.parse(
            fs.readFileSync(
                path.join(location, 'manifest.json')
            ).toString()
        );
        if (!manifest.id || !(/^[a-z0-9]+$/.test(manifest.id))) {
            throw new Error('No valid id specified in the manifest.json. ' +
                'Are you sure you\'re in a plugin folder?');
        } else {
            return manifest.id;
        }
    }
}

/**
 * Checks whether the specified location is a plugin folder
 * @param {string} location The local plugin location
 * @returns {boolean} Location is a plugin folder?
 */
function isPluginFolder(location) {
    return fs.existsSync(path.join(location, 'manifest.json'))
        && fs.existsSync(path.join(location, 'main.js'));
}
