const mongoose = require("mongoose");

// const connectDb = () => {
//   mongoose
//     .connect(process.env.MONGO_URI, { dbName: "FbHelpdesk" })
//     .then(() => {
//       console.log("Database Connection established successfully!");
//     })
//     .catch((err) => {
//       console.log("Error connecting to database: " + err.message);
//     });
// };
const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI,{ dbName: "FbHelpdesk" });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

module.exports = connectDb;
