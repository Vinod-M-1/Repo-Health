const fs = require("fs");
const engine = require("./metricsEngine");
const reviewer = require("./codesmel");
const crawler = require("./crawler");

function readfiles(repoReport,filepaths){
    for(let currpath of filepaths) {
        const code = fs.readFileSync(currpath, "utf-8");
        const obj = engine.summary(code);
        const smells = reviewer.getSmells(obj.ast, obj);
        
        // 3. Instead of console.log, we "push" into the report
        repoReport.push({
            file: currpath,
            Cyclometric: obj.Cyclo,
            linesofcode: obj.loc,
            mi: obj.MI,
            complexity: obj.Cyclo.totalScore,
            smells: smells
        });
    }
    return repoReport;
}


async function runFullRepoAnalysis(repoUrl) {    
    const filepaths = crawler.getProjectFiles(repoUrl, './temp_repo');
    let repoReport = [];
    return readfiles(repoReport,filepaths);
}

module.exports = { runFullRepoAnalysis };

// function analyse(obj,smells){
//     console.log(`Statements found to increase the cyclometric complexity: ${obj.Cyclo.Counter}`);
//     for(let child of obj.Cyclo.funs){
//         console.log(`function name  Counter Depth   LOC: ${child.name} ${child.counter} ${child.depth}  ${child.loc}`);
//     }
//     console.log('HALSTEAD VOLUME DETAILS: ');
//     console.log(obj.Halst.Volume);

//     console.log(`MAINTAINABILITY INDEX: ${obj.MI}`)
//     console.log(`Lines of code: ${obj.loc}`);
//     console.log(smells);
// } 
