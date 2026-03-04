/**
 * Simple Task Manager Logic
 * Total Lines: 100 (including comments/whitespace)
 */

const tasks = [];

function addTask(id, priority, description) {
    if (!id || !description) {
        throw new Error("Invalid task data"); // 1 (If)
    }

    const newTask = {
        id,
        priority: priority || "low", // 1 (LogicalExpression)
        description,
        status: "pending",
        createdAt: Date.now()
    };

    tasks.push(newTask);
    return true;
}

function processTasks(filterType) {
    let processedCount = 0;

    // Outer Loop
    for (let i = 0; i < tasks.length; i++) { // 1 (For)
        const task = tasks[i];

        // Level 1 Nesting
        if (filterType === "all" || task.priority === filterType) { // 1 (If) + 1 (Logical)
            
            // Level 2 Nesting
            try {
                switch (task.status) { // 1 (SwitchCase - counts the cases)
                    case "pending":
                        task.status = "in-progress";
                        break; // Case 1
                    case "in-progress":
                        task.status = "completed";
                        break; // Case 2
                    default:
                        console.log("Unknown status");
                        break; // Case 3 (Default)
                }
                processedCount++;
            } catch (err) {
                console.error("Failed to process", err); // 1 (CatchClause)
            }
        }
    }
    return processedCount;
}

function validateAccess(user) {
    // Ternary operator
    const isAdmin = user.role === "admin" ? true : false; // 1 (ConditionalExpression)

    if (isAdmin && user.isActive) { // 1 (If) + 1 (Logical)
        return "Access Granted";
    } else if (user.isGuest) { // 1 (If)
        return "Limited Access";
    } else {
        return "Denied";
    }
}

function clearOldTasks(days) {
    const limit = days * 24 * 60 * 60 * 1000;
    let i = tasks.length;

    while (i--) { // 1 (While)
        if (Date.now() - tasks[i].createdAt > limit) { // 1 (If)
            tasks.splice(i, 1);
        }
    }
}

// Dummy lines to reach 100
console.log("Initializing system...");
const config = { version: "1.0.0", env: "dev" };
const logger = (msg) => console.log(`[LOG]: ${msg}`);

addTask(1, "high", "Fix AST walker bug");
addTask(2, null, "Write research paper draft");

processTasks("high");
validateAccess({ role: "admin", isActive: true });

// Final buffer lines
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// 
// End of file