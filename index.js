import express from 'express';
import connectDB from './database-connection/db.connect.js';
import userRoutes from './user/user.controller.js';
import productRoutes from './product/product.controller.js';
import cartRoutes from './cart/cart.controller.js';
import cors from 'cors';

const app = express();
app.use(
  cors({
    origin: '*', // allow all origins
  })
);

// to make app understand json
app.use(express.json());

// connect database
await connectDB();

// register routes
app.use(userRoutes);
app.use(productRoutes);
app.use(cartRoutes);

// network port and server
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`App is listening on port ${PORT}`);
});
