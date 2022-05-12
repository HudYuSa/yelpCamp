// initialize mongoose
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// compground model
const Campground = require("../models/campground");

// cities data
const cities = require("./cities");
// seedHelpers
const { place, descriptors, places } = require("./seedHelpers");

// run main function and detect error
main().catch((err) => console.log(err));
// main function
async function main() {
  // connect to the database
  mongoose.connect("mongodb://localhost:27017/yelpCamp", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  await seedDB();
  mongoose.connection.close();
}

async function seedDB() {
  await Campground.deleteMany({});

  for (let i = 0; i < 100; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const place = places[Math.floor(Math.random() * places.length)];
    const desc = descriptors[Math.floor(Math.random() * descriptors.length)];
    const price = (Math.random() * 5).toFixed(2);
    const camp = new Campground({
      title: `${place}, ${desc}`,
      images: [
        {
          url: "https://res.cloudinary.com/dejga8gdb/image/upload/v1650687592/yelpCamp/zttgqbyoo3a7pw8spqws.jpg",
          filename: "yelpCamp/zttgqbyoo3a7pw8spqws",
        },
        {
          url: "https://res.cloudinary.com/dejga8gdb/image/upload/v1650687592/yelpCamp/sabmo9sj8rni4dz6nmjh.jpg",
          filename: "yelpCamp/sabmo9sj8rni4dz6nmjh",
        },
      ],
      price: price,
      description:
        "  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Itaque tempore, consequatur et sunt ex, impedit nostrum nesciunt ratione quisquam nemo obcaecati optio? Ab consequatur saepe ex ea? Aspernatur repellat et, tempora quos itaque",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      // user objectId
      author: "625a8869db1494e91ea2921d",
    });
    await camp.save();
  }
  console.log("data saved");
}
