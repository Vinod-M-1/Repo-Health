/**
 * codesmel.js
 * Purpose: Scans the AST and Metrics for specific "Smells" 
 * that indicate high technical debt.
 */

function getSmells(ast, analysis) {
    const smells = [];
    //analysis is the main object here and ast is the generated tree

    // 1. Structural Smell: Empty Catch Blocks (AST Check)
    function findEmptyCatch(node) {
        if (!node) return;
        
        if (node.type === 'CatchClause' && node.body.body.length === 0) {
            smells.push({
                type: "Empty Catch Block",
                line: node.loc.start.line,
                description: "Errors are being silenced. Add a logger or handle the error.",
                severity: "High"
            });
        }

        // Standard recursive walk
        for (let key in node) {
            if (node[key] && typeof node[key] === 'object') {
                if (Array.isArray(node[key])) {
                    node[key].forEach(child => findEmptyCatch(child));
                } else {
                    findEmptyCatch(node[key]);
                }
            }
        }
    }

    // 2. Metrics-Based Smells (Threshold Checks)
    const THRESHOLDS = {
        MAX_FUNC_LOC: 40,   // Paper notes 'Bulky' functions are harder to maintain
        MAX_FUNC_CC: 10,    // Complexity limit
        MAX_NESTING: 3      // Cognitive load limit
    };


    // Smell: Bulky Function
    analysis.Cyclo.funs.forEach(fn => {
        if (fn.loc > THRESHOLDS.MAX_FUNC_LOC) {
            smells.push({
                type: "Long Function",
                name: fn.name,
                line: fn.loc.startline,
                description: `Function is too long (${fn.loc} lines). Break it into smaller parts.`,
                severity: "Medium"
            });
        }

        // Smell: Complex Function
        if (fn.counter > THRESHOLDS.MAX_FUNC_CC) {
            smells.push({
                type: "High Complexity",
                name: fn.name,
                description: `Function logic is complex (CC: ${fn.counter}).`,
                severity: "High"
            });
        }

        // Smell: Deep Nesting
        if (fn.depth > THRESHOLDS.MAX_NESTING) {
            smells.push({
                type: "Deeply Nested logic",
                name: fn.name,
                description: `Logic is nested ${fn.depth} levels deep. Hard to follow.`,
                severity: "Medium"
            });
        }
    });

    // Run the structural scanner
    findEmptyCatch(ast);

    return smells;
}

module.exports = { getSmells };