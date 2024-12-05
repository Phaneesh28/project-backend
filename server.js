require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwtToken = require('jsonwebtoken');
const path = require('path');
const products = require('./models/products'); // Import Product Schema
const userData = require('./models/users'); // Import User Schema

const app = express();
app.use(express.json());

// Restrict CORS to specific origins in production
const allowedOrigins = ['http://localhost:3000', 'https://your-frontend-url.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

const PORT = process.env.PORT || 3020;
const MONGO_URI = process.env.MONGO_URI;
const MY_SECRET_TOKEN = process.env.MY_SECRET_TOKEN;

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.error('Database Connection Error:', err);
    process.exit(1);
  });

mongoose.connection.once('open', () => {
  console.log('MongoDB Connection Open');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

const authorization = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).send('Unauthorized');
  }
  const token = authHeader.split(' ')[1];
  jwtToken.verify(token, MY_SECRET_TOKEN, (err) => {
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
  try {
    const { username, email, phone, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const checkUser = await userData.findOne({ username });
    if (checkUser) {
      return res.status(422).send('User Already Exists');
    }
    const newUser = new userData({ username, email, phone, password: hashedPassword });
    await newUser.save();
    res.status(201).send('Registered Successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const checkUser = await userData.findOne({ username });
    if (!checkUser) {
      return res.status(400).send('Invalid Username');
    }
    const isPasswordCorrect = await bcrypt.compare(password, checkUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).send('Wrong Password');
    }
    const token = jwtToken.sign({ username }, MY_SECRET_TOKEN, { expiresIn: '1h' });
    res.send({ status: 'ok', token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/products', authorization, async (req, res) => {
  try {
    const allProducts = await products.find({});
    res.send(allProducts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/products/:id', authorization, async (req, res) => {
  try {
    const { id } = req.params;
    const singleProduct = await products.findOne({ id: id.toString() });
    if (!singleProduct) {
      return res.status(404).send('Product Not Found');
    }
    res.send(singleProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Serve React Build Files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
  });
}
