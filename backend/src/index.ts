import express from "express";
import usuariosRouter from "./routes/usuarios.routes";
import restaurantesRouter from "./routes/restaurantes.routes";
import avaliacoesRouter from "./routes/avaliacoes.routes";
import enderecoRouter from "./routes/endereco.routes";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/usuarios", usuariosRouter);
app.use("/api/restaurantes", restaurantesRouter);
app.use("/api/avaliacoes", avaliacoesRouter);
app.use("/api/endereco", enderecoRouter);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export { app };
