import express from "express";
import connectDB from "./database-connection/db.connect.js";
import userRoutes from "./user/user.controller.js";

const app = express();
// to make app understand json

// console.log("first");
app.use(express.json());

// database connection
connectDB();

// register routes
app.use(userRoutes);

// TODO: handle global error

// network port and server
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
