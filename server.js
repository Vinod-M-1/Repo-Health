const express = require("express");
const main = require('./main');
const app = express();
const ejs = require("ejs");
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get('/home', (req,res)=>{
    res.render('home.ejs');
})


app.get('/analyse', async(req,res)=>{
    const repo_url = req.query.url;
    if (!repo_url) {
        return res.status(400).send("Please provide a repo URL");
    }   
    const results = await main.runFullRepoAnalysis(repo_url);
    res.json(results);

})

app.listen(8080, () => {
    console.log("Server running on http://localhost:8080")
});