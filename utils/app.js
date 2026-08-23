const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); 

const authRoutes = require("../routes/authRoutes");
const productsRoutes = require("../routes/productsRoutes");
const orcamentoRoutes = require("../routes/orcamentoRoutes");
const openaiRoutes = require("../routes/openaiRoutes"); 

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/produtos", productsRoutes);
app.use("/api/orcamentos", orcamentoRoutes);
app.use("/api/openai", openaiRoutes); 

module.exports = app;
