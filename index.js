import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Conexión a base de datos SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// modelo Game
const Game = sequelize.define('Game', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  genre: { type: DataTypes.STRING, allowNull: false },
  platform: { type: DataTypes.STRING, allowNull: false }
});

// Sincroniza el modelo con la base de datos
await sequelize.sync();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// POST /game - Crear juego
app.post('/game', async (req, res, next) => {
  try {
    const { name, description, genre, platform } = req.body;
    if (!name || !description || !genre || !platform) {
      const error = new Error('Faltan campos requeridos: name, description, genre, platform');
      error.statusCode = 400;
      throw error;
    }
    const newGame = await Game.create({ name, description, genre, platform });
    res.status(201).json(newGame);
  } catch (err) {
    next(err);
  }
});


// GET /game/:id
app.get('/game/:id', async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      const error = new Error(`Juego con id ${req.params.id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(game);
  } catch (err) {
    next(err);
  }
});

// PUT /game/:id
app.put('/game/:id', async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      const error = new Error(`Juego con id ${req.params.id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    const { name, description, genre, platform } = req.body;
    if (!name || !description || !genre || !platform) {
      const error = new Error('Faltan campos requeridos: name, description, genre, platform');
      error.statusCode = 400;
      throw error;
    }
    await game.update({ name, description, genre, platform });
    res.status(200).json(game);
  } catch (err) {
    next(err);
  }
});

// PATCH /game/:id
app.patch('/game/:id', async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      const error = new Error(`Juego con id ${req.params.id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    await game.update(req.body);
    res.status(200).json(game);
  } catch (err) {
    next(err);
  }
});

// DELETE /game/:id
app.delete('/game/:id', async (req, res, next) => {
  try {
    const game = await Game.findByPk(req.params.id);
    if (!game) {
      const error = new Error(`Juego con id ${req.params.id} no encontrado`);
      error.statusCode = 404;
      throw error;
    }
    await game.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// Ruta no encontrada
app.use((req, res, next) => {
  const error = new Error('Ruta no encontrada');
  error.statusCode = 404;
  next(error);
});

// Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 500) {
    console.error(err.stack);
  } else {
    console.log(`Error ${statusCode}: ${err.message}`);
  }
  res.status(statusCode).json({ error: { message: err.message || 'Error interno del servidor' } });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});