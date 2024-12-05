require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwtToken = require('jsonwebtoken')
const ConnectDb = require('./config/dbConnect')
const userData = require('./models/users')
const products = require('./models/products')
const path = require('path');
app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});


const app = express()
app.use(express.json())
app.use(cors())

console.log(process.env.NODE_ENV)
ConnectDb()

const PORT = process.env.PORT || 3020

mongoose.connection.once('open', () => {
  console.log('Mongodb Connected')
  app.listen(PORT, () => {
    console.log(`app is running on localhost:${PORT}`)
  })
})

mongoose.connection.on('error', (err) => {
  console.log(`${err.message}`)
})

require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;
const MY_SECRET_TOKEN = process.env.MY_SECRET_TOKEN;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Database Connection Error:", err));

  
app.post('/api/register', async (req, res) => {
  const { username, email, phone, password } = req.body
  const hashedPassword = await bcrypt.hash(password, 10)
  const checkUser = await userData.findOne({ username })
  if (checkUser) {
    return res.status(422).send('User Already exits')
  } else {
    const newUser = new userData({
      username,
      email,
      phone,
      password: `${hashedPassword}`,
    })
    await newUser.save()
    res.status(201).send('Registered Successfully')
  }
})

app.post('/api/login', async (req, res) => {
  const decoded = atob(req.body.password)
  const { username } = req.body
  const checkUser = await userData.findOne({ username })
  if (checkUser) {
    const checkPassword = await bcrypt.compare(decoded, checkUser.password)
    if (checkPassword) {
      const payload = { username }
      const token = jwtToken.sign(payload, process.env.MY_SECRET_TOKEN)
      res.send({ status: 'ok', token })
    } else {
      res.status(400)
      res.send('Wrong Password')
    }
  } else {
    res.status(400)
    res.send('Invalid Username')
  }
})
const authorization = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (authHeader === undefined) {
    res.status(401)
    res.send('Unauthorized')
  } else {
    const token = authHeader.split(' ')[1]
    jwtToken.verify(token, process.env.MY_SECRET_TOKEN, async (err, data) => {
      if (err) {
        res.status(400)
        res.send('Not Allowed')
      } else {
        next()
      }
    })
  }
}

const cors = require('cors');
app.use(cors({ origin: 'https://starting-valkyrie-6399c9.netlify.app' }));


app.get('/', (req, res) => {
  res.send('Welcome to the Backend!');
});


app.get('/api/products', authorization, async (req, res) => {
  const allProducts = await products.find({})
  res.send(allProducts)
})

app.get('/api/products/:id', authorization, async (req, res) => {
  const { id } = req.params
  const singleProduct = await products.findOne({ id: id })
  res.send(singleProduct)
})
