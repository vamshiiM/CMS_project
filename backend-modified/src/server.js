import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import path from "path"

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// console.log(__dirname);

// console.log(path.join(__dirname, "../frontend", "dist", "index.html"));

if (process.env !== "production") {
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
}

app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', routes);

app.use(errorHandler);

if (process.env.NODE_ENV === "production") {

  // this will help the server to get to the frontend dist folder
  app.use(express.static(path.join(__dirname, "../frontend/dist"))) // for deployment

  // this will sendFile to the any get requests from server
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  })
}


app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
