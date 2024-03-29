const mongoose = require("mongoose");
const { mongoDB } = require("./config");

main().catch((err)=> console.log(err)); 
async function main() {
    await mongoose.connect(mongoDB);
}

const schema = mongoose.Schema;

const user = new schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    first_name: {type: String, requried: true},
    last_name: {type: String, reqruired: true},
})

const User = mongoose.model("User", user);

module.exports = {
    User
}
