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
    'LogicalExpression'
];

const functionalNodes = [
    'FunctionDeclaration',
    'FunctionExpression',
    'ArrowFunctionExpression'
];

function analysefun(node){
    if (!node) return;
    
    if (complexityNodes.includes(node.type)) {
        newCounter++;
    }
    if(functionalNodes.includes(node.type)) {
        return;
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

}

function walk(node) {
    if (!node) return;

    // Logic: Increment if we find an any loop or conditional statement that adds up to the complexity
    if (complexityNodes.includes(node.type)) {
        Counter++;
    }
    if(node.type == 'LogicalExpression' && (node.operator == '&&' || node.operator == '||')){
        counter++;
    }
    if(functionalNodes.includes(node.type)) {
        newCounter = 0;
        analysefun(node.body);
        if(node.id) console.log(node.id.name,1+newCounter);
        else console.log('Anonymous function: ',1+newCounter );
        Counter += newCounter + 1;
        newCounter = 0;
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

// 5. Output
function showOutput(code){
    const ast = acorn.parse(code, { ecmaVersion: 2020 });
    walk(ast);
    const baseScore = 1;
    console.log(`Base Score: ${baseScore}`);
    console.log(`Statements found to increase cyclometric complexity: ${Counter}`);
    console.log(`Total Score: ${baseScore + Counter}`);
    Counter = 0;   
}

// function showDetails(code){
//     const ast = acorn.parse(code, { ecmaVersion: 2020 });
//     // console.log(ast);
//     let bd = ast.body[0].body.body[0];
//     console.log(bd);
//     // console.log(ast);
//     // let bd = ast.body[0];
//     // console.log(bd)
// }

const code = fs.readFileSync("target.js", "utf-8");           //RETURNS CODE AS STRING
showOutput(code)
// showDetails(code);