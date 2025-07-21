import app from "./app";
import { config } from "./config/config";
import mongoose from "mongoose";

mongoose.connect(config.dbString)
.then(() => console.log("Connected to the db"))

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});