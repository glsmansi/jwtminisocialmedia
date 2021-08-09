const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Post = require("../models/Post");

mongoose.connect("mongodb://localhost:27017/authapp", {
  useNewUrlParser: true,
  userCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Post.deleteMany({});
  for (let i = 0; i < 10; i++) {
    const random1000 = Math.floor(Math.random() * 10);
    const price = Math.floor(Math.random() * 20);
    const camp = new Post({
      author: "61055d85a9b5b55f3bbb30d3",
      location: `${cities[random1000].city}`,

      images: {
        url:
          "https://iso.500px.com/wp-content/uploads/2016/03/stock-photo-142984111.jpg",
        // filename: "Yelpcamp/kuxjqejiaj5xrr9q8lfx",
      },

      description:
        "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Non, commodi.",
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
