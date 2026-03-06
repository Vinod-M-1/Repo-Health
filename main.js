const fs = require("fs");
const engine = require("./metricsEngine");
const reviewer = require("./codesmel");
const crawler = require("./crawler");
const { execSync } = require('child_process');


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
function CalFullRepoAnalysis(repo){
    let totalLOC = 0;
    let totalSmells = 0;
    let sumMI = 0;
    repo.forEach(file=>{ 
        totalLOC += file.linesofcode;
        totalSmells += file.smells.length;
        sumMI += file.mi || 0;
    });

    const targetPath = './temp_repo';
    
    const rawCommits = execSync(`git rev-list --count HEAD`, { cwd: targetPath });
    const commitCount = parseInt(rawCommits.toString().trim()) || 0;
    
    const rawContributors = execSync(`git shortlog -sn`, { cwd: targetPath });
    const contributorLines = rawContributors.toString().trim().split('\n');
    const contributorCount = contributorLines.filter(line => line.length > 0).length || 1;    
    
    const p = (totalLOC * 1) + (contributorCount * 7) + (commitCount * 0.3);
    const issueDensity = totalLOC > 0 ? (totalSmells / totalLOC) * 1000 : 0;
    const avgMI = repo.length > 0 ? (sumMI / repo.length) : 0;
    
    let classification = "Small";
    if (p >= 1000 && p <= 10000) classification = "Medium";
    else if (p > 10000 && p <= 30000) classification = "Large";
    else if (p > 30000) classification = "Very Large";
    repoSummary = {
            projectScale: classification,
            projectSizeValue: p.toFixed(2),
            totalFiles: repo.length,
            totalLines: totalLOC,
            totalIssues: totalSmells,
            avgMaintainability: avgMI.toFixed(2),
            issueDensity: issueDensity.toFixed(2),
    }
    return repoSummary;
} 

async function runFullRepoAnalysis(repoUrl) {    
    const filepaths = crawler.getProjectFiles(repoUrl, './temp_repo');
    let repoReport = [];
    repoReport = readfiles(repoReport,filepaths);
    repoanaly = CalFullRepoAnalysis(repoReport);
    return {repoReport, repoanaly};
}

module.exports = { runFullRepoAnalysis };
