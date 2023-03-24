const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');      //FOR CHANGING THE BEHAVIOR OF THE ROOTS THAT IS FROM POST TO PUT OR PATCH IN
// const Campground = require('./models/campground');      //For including the BOILERPLATE OF HTML
const ejsMate=require('ejs-mate');
const ExpressError=require('./utils/expressError');     //For ACQUIRING THE ERROR HANDELER CLASS WHICH WE HAD MADE
// const catchAsync=require('./utils/catchAsync');         //FOR ACQUIRING THE CATCHASYNC WRAPPER FUNCTION TO CATCH THE ERROR 
const joi=require('joi');                               //FOR AQUIRING THE PACKAGES WHICH WILL HANDLE THE VALIDATION ERROR WITH THE HELP OF JOI
// const {campgroundSchema,reviewSchema}=require('./Schemas');          //FOR REQUIRING THE SCHEMA THAT WE HAVE CREATED FOR DOING THE SERVER SIDE VALIDATION
const Review=require('./models/review');                      //FOR REQUIRING THE REVIEW MODEL THAT WE CREATED TO INTEGRATE THE CAMPGROUNDS WITHIN IT AS A REFERENCE ID

const campgrounds=require('./routes/campgrounds');           //FOR USING THE ROUTE OF CAMPGROUNDS THAT WE HAVE CREATED IN campgrounds.js
const reviews=require('./routes/reviews');                   //SAME AS ABOVE like campgrounds

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify:false                  //for removing the deprecation error
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));    //HERE THIS MIDDLEWARE IS TO ENSURE THAT WE CAN USE STATIC FILES LIKE IMAGES,CSS ETC. AND HERE PUBLIC IS THE NAME OF THE FOLDER IN EHICH OUR STATIC FILES ARE STORED  


//   AFTER RECONSTRUCTING THE ROUTES FOR REVIEWS AND CAMPGROUNDS
app.use('/campgrounds',campgrounds);                         //HERE /campgrounds will act as pre text(that is as starting point of every route that are presents in campgrounds.js) that is  we can request anything by using /campgrounds in the campgrounds.js see in campgrounds.js
app.use('/campgrounds/:id/reviews/',reviews);



//HOME PAGE
app.get('/', (req, res) => {
    res.render('home')
});


//ERROR HANDLER
app.all('*',(req,res,next)=>{
    next(new ExpressError("page not found",404));
})


// ERROR HANDLER 
app.use((err,req,res,next)=>{
    
   const {statuscode=500}=err;
   if(!err.message){message="Something went wrong"};
   res.status(statuscode).render('../views/error',{err});
    
})



app.listen(3000, () => {
    console.log('Serving on port 3000')
})