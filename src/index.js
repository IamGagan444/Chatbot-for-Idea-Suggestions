import express from "express";
import cors from "cors";

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(ErrorMiddleware)

import Airouter from "./routes/AiRoute.js"
import { ErrorMiddleware } from "./middleware/error.middleware.js";


app.use("/api",Airouter)

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
