const fs = require("fs");
const engine = require("./metricsEngine");
const reviewer = require("./codesmel");

const code = fs.readFileSync("target.js", "utf-8");           //RETURNS CODE AS STRING
obj = engine.summary(code);
const smells = reviewer.getSmells(obj.ast, obj);
// console.log(obj)


function analyse(obj,smells){
    console.log(smells);
    console.log(`Statements found to increase the cyclometric complexity: ${obj.Cyclo.Counter}`);
    for(let child of obj.Cyclo.funs){
        console.log(`function name  Counter Depth   LOC: ${child.name} ${child.counter} ${child.depth}  ${child.loc}`);
    }
    console.log('HALSTEAD VOLUME DETAILS: ');
    console.log(obj.Halst.Volume);

    console.log(`MAINTAINABILITY INDEX: ${obj.MI}`)
    console.log(`Lines of code: ${obj.loc}`);

}

analyse(obj, smells)