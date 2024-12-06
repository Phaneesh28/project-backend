const mongoose = require('mongoose');

const ConnectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1); // Exit process on failure
  }
};

module.exports = ConnectDb;
