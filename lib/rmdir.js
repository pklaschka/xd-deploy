/*
 * Copyright (c) 2020. by Pablo Klaschka
 */

const fs = require('fs');
const path = require('path');

/**
 * Recursive removed directory for non-empty directories
 *
 * Inspired by [a StackOverflow answer](https://stackoverflow.com/questions/18052762/remove-directory-which-is-not-empty/32197381#32197381)
 * @param {string} dirPath The path to the directory
 */
function rrmdir(dirPath) {
    if (fs.existsSync(dirPath)) {
        // `dirPath` exists
        fs.readdirSync(dirPath).forEach((file) => {
            // for each file/directory in the `dirPath`, ...
            const entry = path.join(dirPath, file);
            if (fs.lstatSync(entry).isDirectory()) { // ... remove recursively if it is a direcotry
                rrmdir(entry);
            } else { // ... or delete it if it's a file
                fs.unlinkSync(entry);
            }
        });

        // Directory is now empty => Delete it
        fs.rmdirSync(dirPath);
    }
}

module.exports = rrmdir;
