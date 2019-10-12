const archiver = require('archiver');
const fs = require('fs');
const path = require('path');


/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory(source, out) {
    if (fs.existsSync(out))
        fs.unlinkSync(out);

    const archive = archiver('zip', {zlib: {level: 9}});
    const stream = fs.createWriteStream(out);

    return new Promise((resolve, reject) => {
        const dir = path.join(process.cwd(), source);
        archive
            .directory(source, false)
            .on('error', e => reject(e))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize().catch(e => reject(e));
    });
}

module.exports = zipDirectory;
