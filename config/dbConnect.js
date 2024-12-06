const mongoose = require('mongoose');
const mongoURI ='mongodb+srv://admin:Admin@123@cluster0.zbool.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
if (!mongoURI) {
  console.error("MongoDB URI is undefined. Please check your connection string.");
  process.exit(1); // Exit the application if the URI is not set
}
const ConnectDb = async () => {
  try {
    await mongoose.connect('mongodb+srv://admin:Admin@123@cluster0.zbool.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
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
