const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function cloneRepo(repo_url, targetFolder){
    if (fs.existsSync(targetFolder)) {
        fs.rmSync(targetFolder, { recursive: true, force: true });
    }
    console.log(`Cloning started into ${targetFolder}..`);
    execSync(`git clone ${repo_url} ${targetFolder}`);
    console.log('Cloning finished..');
}


function findjs(arr, currpath){
    let temp = fs.readdirSync(currpath);
    for (let child of temp){
        const fullpath = path.join(currpath, child);

        if(child === '.git' || child === 'node_modules') continue;

        if(fs.statSync(fullpath).isDirectory()){
            findjs(arr, fullpath);
        }else{
            if(child.endsWith('.js')){
                arr.push(fullpath);
            }
        }
    }
    return arr;
}

function getProjectFiles(url, targetFolder){
    if(url != '') cloneRepo(url, targetFolder);
    let arr = [];
    findjs(arr, targetFolder);
    return arr;
}


module.exports = { getProjectFiles };

// Read the contents of the folder.

// Loop through every item.

// If it's a file and ends with .js, save its path to an array.

// If it's a folder, call the same function again on that folder to look inside it.