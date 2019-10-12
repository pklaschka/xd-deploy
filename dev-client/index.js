const fs = require('fs');
const path = require('path');

/**
 * Run the developer client
 * @param {'watch' | 'install'} action The action that should get performed.
 * @param {string} serverLocation The server location, e.g., http://localhost:8080
 * @param {string} [location='.'] The plugin folder location.
 * @throws {Error} When not inside a plugin folder
 */
module.exports = function(action, serverLocation, location = '.') {
    if (!isPluginFolder(location)) {
        throw new Error('Not inside a plugin folder');
    }

    if (action === 'watch') {

    } else if (action === 'install') {
        send(serverLocation, location);
    }
};

/**
 * Send the current version to the server
 * @param {string} serverLocation The server location
 * @param {string} localLocation The local plugin location
 * @throws {Error} When not inside a plugin folder
 */
function send(serverLocation, localLocation) {
    const id = getId(localLocation);
    console.info('Sending plugin', id);
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
        if (!manifest.id || !/[a-z0-9]+/.test(manifest.id)) {
            throw new Error('No id specified in the manifest.json. Are you sure you\'re in a plugin folder?');
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
