const acorn = require("acorn");
const fs = require("fs");


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

function analysefun(node){
    if (!node) return;
    
    if(functionalNodes.includes(node.type)) {
        return;
    }
    //logic for complexity
    if(complexityNodes.includes(node.type)){
        newCounter++;
    }
    
    if(node.type == 'LogicalExpression' && (node.operator == '&&' || node.operator == '||')){
        newCounter++;
    }

    if (nestingNodes.includes(node.type)) {
        currDepth++;
        if(maxDepth < currDepth) maxDepth = currDepth;
    }
    
    for (let key in node) {
        if (node[key] && typeof node[key] === 'object') {
            // If it's an array (like a block of code), walk each item
            if (Array.isArray(node[key])) {
                node[key].forEach(child => analysefun(child));
            } else {
                // If it's a single node object, walk it
                analysefun(node[key]);
            }
        }
    }
    if (nestingNodes.includes(node.type)) currDepth--;
}

function walk(node) {
    if (!node) return;

    // Logic: Increment if we find an any loop or conditional statement that adds up to the complexity
    if (complexityNodes.includes(node.type)) {
        Counter++;
    }
    if(node.type == 'LogicalExpression' && (node.operator == '&&' || node.operator == '||')){
        Counter++;
    }
    if(functionalNodes.includes(node.type)) {
        analysefun(node.body);
        
        const loc = node.loc.end.line - node.loc.start.line + 1;
        
        if(node.id) console.log(node.id.name," ",1+newCounter," ",loc, " ", maxDepth);
        else console.log('Anonymous function: '," ",1+newCounter, ' ', loc, " ", maxDepth);
        Counter += newCounter + 1;
        
        newCounter = 0;
        maxDepth = 0;
        currDepth = 0;
        
        return;
    }
    // Recursively check all children of this node
    // We loop through the keys because nodes have different properties (body, left, right, etc.)
    for (let key in node) {
        if (node[key] && typeof node[key] === 'object') {
            // If it's an array (like a block of code), walk each item
            if (Array.isArray(node[key])) {
                node[key].forEach(child => walk(child));
            } else {
                // If it's a single node object, walk it
                walk(node[key]);
            }
        }
    }
}

let Counter = 0;
let newCounter = 0;
let maxDepth = 0;
let currDepth = 0;

// 5. Output
function calCyclomaticComplexity(code){
    const ast = acorn.parse(code, { ecmaVersion: "latest", locations: true });
    walk(ast);
    const baseScore = 1;
    console.log(`Base Score: ${baseScore}`);
    console.log(`Statements found to increase cyclometric complexity: ${Counter}`);
    console.log(`Total Score: ${baseScore + Counter}`);
    mainCounter = Counter;
    Counter = 0;   
}



function walkHal(node){
    if(!node) return;

    if(node.type == 'Identifier'){
        totalOperands++;
        uniqueOperands.add(node.name); 
    }
    else if(node.type == 'Literal'){
        totalOperands++;
        uniqueOperands.add(node.value);
    }
    if(halsteadNodes.includes(node.type)){
        totalOperators++;
        uniqueOperators.add(node.operator || node.type)
    }

    for(let key in node){
        if(node[key] && typeof node[key]=== 'object'){
            if(Array.isArray(node[key])){
                node[key].forEach((ele)=>(walkHal(ele)))
            }else{
                walkHal(node[key]);
            }
        }
    }
}

let totalOperators = 0; // N1
let totalOperands = 0;  // N2
const uniqueOperators = new Set(); // n1
const uniqueOperands = new Set();  // n2

function calHalstead(code){
    const ast = acorn.parse(code, { ecmaVersion: "latest", locations: true });
    // console.log(ast)
    walkHal(ast);
    console.log(`Total  Operators: ${totalOperators}`);
    console.log(`Total  Operands: ${totalOperands}`);
    let x = uniqueOperators.size;
    let y = uniqueOperands.size;
    console.log(x,' ',y)
    let V = (totalOperators + totalOperands)*Math.log2(x+y);
    console.log(V);
    Volume = V;
    totalOperators = 0;
    totalOperands = 0;
    uniqueOperators.clear()
    uniqueOperands.clear();
}

function showDetails(code){
    const ast = acorn.parse(code, { ecmaVersion: 2020, locations: true });
    console.log(ast);
    console.log(ast.loc.end.line);              //CALCULATES THE TOTAL LINES OF CODE OF FILE
}


function summary(code){
    const ast = acorn.parse(code, { ecmaVersion: "latest", locations: true });
    let totalloc = ast.loc.end.line;  

    rawMI = 171 - 5.2 * Math.log(Volume || 1) - 0.23 * mainCounter - 16.2 * Math.log(totalloc || 1);

    let normalizedMI = Math.max(0, Math.min(100, (rawMI * 100) / 171));

    console.log(`--- 🏆 RepoAudit Final Report ---`);
    console.log(`Total Volume (V): ${Volume.toFixed(2)}`);
    console.log(`Maintainability Score: ${normalizedMI.toFixed(2)}%`);
}
let Volume;
let mainCounter;
const code = fs.readFileSync("target.js", "utf-8");           //RETURNS CODE AS STRING
calCyclomaticComplexity(code)
// showDetails(code);
calHalstead(code);
summary()