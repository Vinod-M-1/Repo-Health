//REQUIREMENTS
const acorn = require("acorn");

//Nodes types which add up to cyclometric complexity
const complexityNodes = [
    'IfStatement',
    'ForStatement',
    'WhileStatement',
    'DoWhileStatement',
    'SwitchCase',
    'CatchClause',
    'ConditionalExpression',
    'ForInStatement',
    'ForOfStatement'
];

const nestingNodes = [
    'IfStatement',
    'ForStatement',
    'WhileStatement',
    'DoWhileStatement',
    'CatchClause',
    'ForInStatement',
    'ForOfStatement',
    'SwitchStatement'
];

const halsteadNodes = [
    'BinaryExpression',
    'AssignmentExpression',
    'UnaryExpression',
    'IfStatement',
    'LogicalExpression',
    'ForStatement',
    'WhileStatement',
    'DoWhileStatement',
    'ReturnStatement',
    'SwitchStatement'
];


//To detect functional part of the code
const functionalNodes = [
    'FunctionDeclaration',
    'FunctionExpression',
    'ArrowFunctionExpression'
];

function analysefun(node, state){
    if (!node) return;
    
    if(functionalNodes.includes(node.type)) {
        return;
    }
    //logic for complexity
    if(complexityNodes.includes(node.type)){
        state.newCounter++;
    }
    
    if(node.type == 'LogicalExpression' && (node.operator == '&&' || node.operator == '||')){
        state.newCounter++;
    }

    if (nestingNodes.includes(node.type)) {
        state.currDepth++;
        if(state.maxDepth < state.currDepth) state.maxDepth = state.currDepth;
    }
    
    for (let key in node) {
        if (node[key] && typeof node[key] === 'object') {
            // If it's an array (like a block of code), walk each item
            if (Array.isArray(node[key])) {
                node[key].forEach(child => analysefun(child, state));
            } else {
                // If it's a single node object, walk it
                analysefun(node[key], state);
            }
        }
    }
    if (nestingNodes.includes(node.type)) state.currDepth--;
}

function walk(node, state) {
    if (!node) return;

    // Logic: Increment if we find an any loop or conditional statement that adds up to the complexity
    if (complexityNodes.includes(node.type)) {
        state.Counter++;
    }
    if(node.type == 'LogicalExpression' && (node.operator == '&&' || node.operator == '||')){
        state.Counter++;
    }

    if(functionalNodes.includes(node.type)) {
        let fnState = { newCounter: 0, maxDepth: 0, currDepth: 0 };
        analysefun(node.body, fnState);
        
        const loc = node.loc.end.line - node.loc.start.line + 1;
        let name = node.id?node.id.name:'Anonymous function:';
        state.funs.push({
            name: name,
            counter: fnState.newCounter,
            depth: fnState.maxDepth,
            loc: loc
        })
        //Increase the main state counter

        state.Counter += (fnState.newCounter + 1);        
        return;
    }
    // Recursively check all children of this node
    // We loop through the keys because nodes have different properties (body, left, right, etc.)
    for (let key in node) {
        if (node[key] && typeof node[key] === 'object') {
            // If it's an array (like a block of code), walk each item
            if (Array.isArray(node[key])) {
                node[key].forEach(child => walk(child, state));
            } else {
                // If it's a single node object, walk it
                walk(node[key], state);
            }
        }
    }
}


// 5. Calculate cyclometric complexity of code and return it
function calCyclomaticComplexity(code){    
    //reseting this on every run
    let state = {Counter : 0, funs:[]};

    walk(code, state);

    state.totalScore = 1+state.Counter;
    
    // console.log(`Base Score: 1`);
    // console.log(`Statements found to increase cyclometric complexity: ${state.Counter}`);
    // console.log(`Total Score: ${totalScore}`);
    return state;
}


//walks down nodes to get to operators and oeprands
function walkHal(node, stats){
    if(!node) return;

    if(node.type == 'Identifier'){
        stats.totalOperands++;
        stats.uniqueOperands.add(node.name); 
    }
    else if(node.type == 'Literal'){
        stats.totalOperands++;
        stats.uniqueOperands.add(node.value);
    }
    if(halsteadNodes.includes(node.type)){
        stats.totalOperators++;
        stats.uniqueOperators.add(node.operator || node.type)
    }

    for(let key in node){
        if(node[key] && typeof node[key]=== 'object'){
            if(Array.isArray(node[key])){
                node[key].forEach((ele)=>(walkHal(ele,stats)))
            }else{
                walkHal(node[key],stats);
            }
        }
    }
}


// Calculate halstead volume of code and return it
function calHalstead(code){
    let stats = { 
        totalOperators: 0, totalOperands: 0, 
        uniqueOperators: new Set(), uniqueOperands: new Set() 
    };
    walkHal(code,stats);
    
    let x = stats.uniqueOperators.size;
    let y = stats.uniqueOperands.size;
    let V = (stats.totalOperators + stats.totalOperands) * Math.log2(x + y || 1);
    const HV = {
        funstats: stats,
        Volume: V
    }
    // console.log(`Total Volume (V): ${V.toFixed(2)}`);
    return HV;
}


// For a given file code to this gives its code analysis
function summary(code){
    const ast = acorn.parse(code,{ecmaVersion: "latest", locations: true})
    
    const CC = calCyclomaticComplexity(ast);
    //example Cyclometric complexity object
    // state = {
    //     Counter,
    //     totalScore,
    //     funs [
    //         {
    //         name: name,
    //         counter: fnState.newCounter,
    //         depth: fnState.maxDepth,
    //         loc: loc
    //         }
    //     ]
    // }
    
    const volume = calHalstead(ast);
    // volume object = {
    //     funstats: stats,
    //     Volume: V
    // }

    let totalloc = ast.loc.end.line;  
    
    rawMI = 171 - 5.2 * Math.log10(volume.Volume || 1) - 0.23 * CC.totalScore - 16.2 * Math.log10(totalloc || 1);
    let normalizedMI = Math.max(0, Math.min(100, (rawMI * 100) / 171));
    
    let fileanalysis = {
        Cyclo : CC,
        Halst : volume,
        rawMI : rawMI,
        MI : normalizedMI,
        loc: totalloc,
        ast: ast
    };
    return fileanalysis;
    // console.log(fileanalysis);
    // console.log(`Total Volume (V): ${volume.Volume.toFixed(2)}`);
    // console.log(`Maintainability Score: ${normalizedMI.toFixed(2)}%`);
}



module.exports = { summary };

// function showDetails(code){
//     const ast = acorn.parse(code, { ecmaVersion: 2020, locations: true });
//     console.log(ast);
//     console.log(ast.loc.end.line);              //CALCULATES THE TOTAL LINES OF CODE OF FILE
// }
// showDetails(code);
