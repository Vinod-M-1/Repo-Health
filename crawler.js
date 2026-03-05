const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function cloneRepo(repo_url){
    const folder = './temp_repo'
    if (fs.existsSync(folder)) {
        fs.rmSync(folder, { recursive: true, force: true });
    }
    console.log("Cloning started..");
    execSync(`git clone ${repo_url} ${folder}`);
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

function getProjectFiles(url, StartPath){
    if(url != '') cloneRepo(url);
    let arr = [];
    findjs(arr, StartPath);
    return arr;
}


module.exports = { getProjectFiles };

// Read the contents of the folder.

// Loop through every item.

// If it's a file and ends with .js, save its path to an array.

// If it's a folder, call the same function again on that folder to look inside it.