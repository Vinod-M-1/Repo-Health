# Repo-Health
Contains daily code for my project of repo health
1. Metadata Analysis (The Threshold Check)Instead of looking at the code line-by-line again,
you use the Summary Object (analysis) you already created.
The Logic: You iterate through the analysis.Cyclo.funs array.The Filter: You compare each function's loc, counter, and depth against your THRESHOLDS constants.The Action: If a function exceeds a limit (e.g., $CC > 10$), you wrap that "event" into an object.Why this is smart: It’s incredibly fast. You’re using pre-calculated numbers to find "Bulky" or "Complex" functions without re-scanning the file.

2. Tree Traversal (The Structural Check)For smells that don't have a "number" (like an empty catch block), you dive back into the AST.The Node Hunt: You look for a node where type === 'CatchClause'.The Logic Gate: You check node.body.body.length. If it's 0, the developer wrote the catch but forgot to actually handle the error.The Tracking: You use node.loc.start.line to give the developer a "GPS coordinate" for the fix.


You mentioned severity is variable. In a real tool, you could even make the THRESHOLDS dynamic. For a Small project ($P < 1000$), you might be strict ($CC > 8$), but for a Very Large legacy project, you might relax them ($CC > 15$).