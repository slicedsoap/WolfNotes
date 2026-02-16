const express = require("express");
const authRoutes = require("./routes/auth");
const classesRoutes = require("./routes/classes");
const notesRoutes = require("./routes/notes");
const studentsRoutes = require("./routes/students");
const usersRoutes = require("./routes/users.js");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/classes", classesRoutes);
app.use("/notes", notesRoutes);
app.use("/students", studentsRoutes);
app.use("/users", usersRoutes);

app.get("/", (req, res) => {
  res.json({ your_api: "it works" });
});

// Ask our server to listen for incoming connections
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
