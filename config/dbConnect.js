const mongoose = require('mongoose')

const ConnectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
  } catch (err) {
    console.log(`${err.message}`)
  }
}
module.exports = ConnectDb
