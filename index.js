const express = require("express");
const main = require('./main');
const app = express();
const ejs = require("ejs");
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get('/', (req,res)=>{
    res.render('home.ejs');
})


app.get('/analyse', async(req,res)=>{
    const repo_url = req.query.url;
    if (!repo_url) {
        return res.status(400).send("Please provide a repo URL");
    }   
    const { repoReport, repoanaly } = await main.runFullRepoAnalysis(repo_url);
    res.render("analyse.ejs", {
        repo: repo_url,
        files: repoReport,
        summary: repoanaly
    });
})

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});