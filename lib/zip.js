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
    // Remove zip file if it already exists:
    if (fs.existsSync(zipPath))
        fs.unlinkSync(zipPath);

    const archive = archiver('zip', {zlib: {level: 8}});
    const stream = fs.createWriteStream(zipPath);

    return new Promise((resolve, reject) => {
        path.join(process.cwd(), dirPath);
        archive
            .directory(dirPath, false)
            .pipe(stream);

        archive.on('error', e => reject(e));

        stream.on('close', () => resolve());
        archive.finalize().catch(e => reject(e));
    });
}

module.exports = zipDirectory;
