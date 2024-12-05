require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwtToken = require('jsonwebtoken');
const path = require('path');
const ConnectDb = require('./config/dbConnect');
const userData = require('./models/users');
const products = require('./models/products');

// Initialize Express App
const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Connect to MongoDB
ConnectDb();

const PORT = process.env.PORT || 3020;
const MONGO_URI = process.env.MONGO_URI;
const MY_SECRET_TOKEN = process.env.MY_SECRET_TOKEN;

// Establish MongoDB Connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('Database Connection Error:', err));

// On successful connection
mongoose.connection.once('open', () => {
  console.log('MongoDB Connection Open');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB Connection Error:', err);
});

// Authorization Middleware
const authorization = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).send('Unauthorized');
  }
  const token = authHeader.split(' ')[1];
  jwtToken.verify(token, MY_SECRET_TOKEN, (err, data) => {
    if (err) {
      return res.status(403).send('Forbidden');
    }
    next();
  });
};

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Backend!');
});

app.post('/api/register', async (req, res) => {
  const { username, email, phone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const checkUser = await userData.findOne({ username });

  if (checkUser) {
    return res.status(422).send('User Already Exists');
  }

  const newUser = new userData({
    username,
    email,
    phone,
    password: hashedPassword,
  });

  await newUser.save();
  res.status(201).send('Registered Successfully');
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const checkUser = await userData.findOne({ username });

  if (!checkUser) {
    return res.status(400).send('Invalid Username');
  }

  const isPasswordCorrect = await bcrypt.compare(password, checkUser.password);
  if (!isPasswordCorrect) {
    return res.status(400).send('Wrong Password');
  }

  const payload = { username };
  const token = jwtToken.sign(payload, MY_SECRET_TOKEN, { expiresIn: '1h' });
  res.send({ status: 'ok', token });
});

app.get('/api/products', authorization, async (req, res) => {
  const allProducts = await products.find({});
  res.send(allProducts);
});

app.get('/api/products/:id', authorization, async (req, res) => {
  const { id } = req.params;
  const singleProduct = await products.findOne({ id });
  if (!singleProduct) {
    return res.status(404).send('Product Not Found');
  }
  res.send(singleProduct);
});

// Serve the React Build Files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });
}
