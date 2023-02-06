const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');   //DOUBLE .. FOR 

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});   //WILL DELETE ANYTHING IN OUT CAMP GROUNDS DATABASE AND INSERT 50 NEW 
    
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price=Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image:'https://source.unsplash.com/random/483251',
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium, ipsa dolores, vero cumque voluptatem odit incidunt inventore autem, provident laudantium repudiandae illo possimus ducimus adipisci. Numquam eius alias labore harum?",
            price:price
        })
        await camp.save();
    }
   
}

//THE ABOVE CHUNK OF CODE WILL ADD 50 CITIES RANDOMLY IN OUR DATABASE campgrounds

seedDB().then(() => {
    // mongoose.connection.close();
    console.log("inserted");
})