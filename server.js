import cookieParser from 'cookie-parser';
import express  from 'express';
import cors from 'cors'
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoutes.js';


const app = express();
const port = process.env.PORT ||8087;

await connectDB()

const allowedOrigins =['http://localhost:5173']

//MiddleWare Configuration 
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins,Credentials:true}))


app.get("/",(req,res)=>res.send("API is Working"));

app.use("/user", userRouter);



app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})



