require('dotenv').config()
const MONGO_URL = process.env.MONGO_URL
//console.log("utils/config.js, mongourl:", MONGO_URL)
module.exports = {
  MONGO_URL
}