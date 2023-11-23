const express = require("express");
const courseRouter = require("./routers/courseAllocation");
const taRouter = require("./routers/taAllocation");

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
	res.status(200).send("Welcome to CSIS Course/TA Allocation API 🚀");
});

app.use("/course", courseRouter);
app.use("/ta", taRouter);

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
