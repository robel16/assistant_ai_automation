require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { PORT, MONGODB_URL } = require("./config/config");
const { timeStamp } = require("console");
const logger = require("./utils/logger");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req,res,next)=>{
    logger.info(`${req.method} ${req.originalUrl}`)
    next()
})
mongoose
	.connect(MONGODB_URL, {})
	.then(() => logger.info("mongoDb connected"), console.log("mongoDb connected"))

	.catch((err) => logger.error("mongoDb connection failed", err));


app.get("/health", (req, res) => {
	res.status(200).json({
		status: "health",
		timeStamp: new Date().toISOString(),
		services: ["nlp", "calendar", "email", "reminder"],
	});
});

app.use((err, req, res, next) => {
	console.log(err);
	res.status(500).json({
		status: "error",
		message: "Internal server error",
	});
    logger.error("Internal server error", err);

});

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)


    logger.info(`server is running on ${PORT}`)

})
