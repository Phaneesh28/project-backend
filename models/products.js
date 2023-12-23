const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
  id: Number,
  productName: String,
  image: String,
  description: String,
  price: Number,
  specs: Object,
})

module.exports = mongoose.model('Products', ProductSchema)
