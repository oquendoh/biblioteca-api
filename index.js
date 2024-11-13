const express = require('express');
const sequelize = require('./config/db');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();
const app = express();
const port = 3000;

app.use(express.json());
app.use('/api/usuarios', userRoutes); // Rutas para los usuarios
app.use('/api/libros', authMiddleware, bookRoutes);

sequelize
  .authenticate()
  .then(() => {
    console.log('Conectado a la db');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor escuchando en el puerto ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar a la db:', error);
  });
