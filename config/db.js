const mongoose = require('mongoose')
const colors = require("colors")

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected to MongoDB database ${mongoose.connection.host}`.bgMagenta.white)
        // mongoose.connection.host shows the address of cluster
    } catch (error) {
        console.log(`MongoDB Database Connection ${Error}`.bgRed.white)
    }
}

module.exports = connectDB