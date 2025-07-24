import cookieParser from 'cookie-parser';
import express  from 'express';
import cors from 'cors'
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js'
import planRoutes from './routes/planRoutes.js'
import roomRoutes from './routes/roomRoutes.js';
import blockRoutes from './routes/blockRoutes.js';
import contactUsRoutes from './routes/contactUsRoutes.js';

const app = express();
const port = process.env.PORT ||8087;

await connectDB()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5173/malla-reddy-university'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

//MiddleWare Configuration 
app.use(express.json());
app.use(cookieParser());


app.get("/",(req,res)=>res.send("API is Working"));

app.use("/user", userRouter);
app.use('/user', orderRoutes);
app.use('/user', planRoutes);
app.use('/user/rooms', roomRoutes);
app.use('/user/blocks', blockRoutes);
app.use('/user', contactUsRoutes);



app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})



