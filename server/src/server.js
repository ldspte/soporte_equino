require('dotenv').config();
const express = require('express'); // Asegúrate de importar express
const cors = require('cors');
const app = express();
const bcrypt = require('bcryptjs');
const PORT = process.env.PORT || 3001;

const route = require('./routes/index'); // Asegúrate de que la ruta sea correcta

app.use(cors()); // Puedes configurar CORS aquí si es necesario
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public')));
// Servir archivos subidos (fotos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/', route);

// Ruta para manejar el ruteo de React (debajo de las rutas de la API)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  const contraseña = 'fabi123';
  const hashpassword = bcrypt.hashSync(contraseña, 10);
  console.log(hashpassword);
});

module.exports = app;