const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');      //FOR CHANGING THE BEHAVIOR OF THE ROOTS THAT IS FROM POST TO PUT OR PATCH IN
const Campground = require('./models/campground');      //For including the BOILERPLATE OF HTML
const ejsMate=require('ejs-mate');
const ExpressError=require('./utils/expressError');     //For ACQUIRING THE ERROR HANDELER CLASS WHICH WE HAD MADE
const catchAsync=require('./utils/catchAsync');         //FOR ACQUIRING THE CATCHASYNC WRAPPER FUNCTION TO CATCH THE ERROR 
const joi=require('joi');                               //FOR AQUIRING THE PACKAGES WHICH WILL HANDLE THE VALIDATION ERROR WITH THE HELP OF JOI
const {campgroundSchema}=require('./Schemas');          //FOR REQUIRING THE SCHEMA THAT WE HAVE CREATED FOR DOING THE SERVER SIDE VALIDATION

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

const app = express();

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


const validateCampground=(req,res,next)=>{                      //THIS FUNCTIONS CANTAINS THE MIDDLE WARE FOR CHECKING THE SERBER SIDE VALIDATION ERROR HANDLING IF WE HAD USED APP.USE IT WOULD RUN EVERYTIME

    
    const {error}=campgroundSchema.validate(req.body);          //VALIDATING THAT THE DATA FOR EVERY CONTENT IS PRESENT IN THE REQ BODY
    if(error){                                                  //IF ANY ERROR IS PRESENT IT WILL BE RECTIFIED AND THE 
        const msg=error.details.map(el=>el.message).join(',')   //TO MAKE THE ERROR INTO A SINGLE STRING
        throw new ExpressError(msg,400)                         //CONTROL WILL BE SENT TO OUR ERROR HANDLER
    }
    else
    { 
        next();                                                 //IF NO ERROR THEN THE CONTROL WILL BE SENT TO THE NEXT ROUTE HANDELER AS WE HAVE USED NEXT() HERE 
    }
}


app.get('/', (req, res) => {
    res.render('home')
});


//READ
app.get('/campgrounds', catchAsync(async (req, res,next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

//FORM FOR CREATING NEW
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//REQUEST SERVING FORM FOR CREATE NEW
app.post('/campgrounds', validateCampground, catchAsync(async (req, res,next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

//READ SINGLE 
app.get('/campgrounds/:id', catchAsync(async (req, res,next) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground });
}));

//FORM FOR UPDATING
app.get('/campgrounds/:id/edit', catchAsync(async (req, res,next) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))

//REQUES SERVING UPDATE FORM
app.put('/campgrounds/:id', validateCampground,catchAsync(async (req, res,next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });  //HERE THIS ... IS SPREADING THE INFO WE HAVE GOT FROM FORM AS REQ.BODY
    res.redirect(`/campgrounds/${campground._id}`)
}));

//DELETE
app.delete('/campgrounds/:id', catchAsync(async (req, res,next) => {   //CATCHASYNC WILL HANDLE THE ERRORS WHICH ACCURR AT SERVER SIDE
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

//ERROR HANDLER
app.use('*',(req,res,next)=>{
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