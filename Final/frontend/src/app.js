const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT;
const frontendRoutes = require('./frontendRouter');

app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/static"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", frontendRoutes);

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));