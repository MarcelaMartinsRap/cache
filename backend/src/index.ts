import express from "express";
import produtosRouter from "./routes/produtos.routes.js";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/produtos", produtosRouter);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export { app };
