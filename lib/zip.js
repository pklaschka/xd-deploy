const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

/**
 * Zip contents of a directory
 * @param {String} dirPath The path of the directory whose contents get zipped
 * @param {String} zipPath The path of the zip file
 * @returns {Promise<void>} A promise that resolves when the Zip file is complete, and rejects on error.
 */
function zipDirectory(dirPath, zipPath) {
    if (fs.existsSync(zipPath))
        fs.unlinkSync(zipPath); // Remove zip file if it already exists:

    const archive = archiver('zip', {zlib: {level: 8}});
    const stream = fs.createWriteStream(zipPath); // Create a write stream for zipping

    // Await the zipping of the directory
    return new Promise((resolve, reject) => {
        path.join(process.cwd(), dirPath); // Build the path of the directory whose contents get zipped
        archive
            .directory(dirPath, false) // Zip the contents of the directory
            .pipe(stream); // And pipe it into the write stream

        archive.on('error', e => reject(e)); // On error reject

        stream.on('close', () => resolve()); // Resolve when write stream gets closed
        archive.finalize().catch(e => reject(e)); // Finalize the stream, reject on error
    });
}

module.exports = zipDirectory;
