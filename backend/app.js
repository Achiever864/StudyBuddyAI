import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";
import converseRouter from "./routes/conversation.route.js";

const app = express();

app.set("trust proxy", 1); //for render and hosting services

app.use(helmet());

const allowedOrigins = [
    "http://localhost:5173",
    "https://study-buddy-ai-lemon.vercel.app"
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use(express.json({ limit: "10mb" }));

app.use(hpp());

//------Custom Routes------------->
app.use("/api/auth", authRouter);
app.use("/api/conversation", converseRouter);
app.use("/api/message", messageRouter);


app.get("/", (req, res) => {
    res.send("Server is running");
});


//a centralized error fallback
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.message === "Not allowed by CORS"){
        return res.status(403).json({ message: "Origin not permitted" });
    }

    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === "production"
            ? "Something went wrong"
            : err.message
    });
});


export default app;