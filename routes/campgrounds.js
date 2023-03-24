const express=require('express');
const router=express.Router();   //FOR USING THE ROUTING
const catchAsync=require('../utils/catchAsync');         //FOR ACQUIRING THE CATCHASYNC WRAPPER FUNCTION TO CATCH THE ERROR 
const ExpressError=require('../utils/expressError');     //For ACQUIRING THE ERROR HANDELER CLASS WHICH WE HAD MADE
const Campground = require('../models/campground');      //For including the BOILERPLATE OF HTML
const {campgroundSchema}=require('../Schemas');          //FOR REQUIRING THE SCHEMA THAT WE HAVE CREATED FOR DOING THE SERVER SIDE VALIDATION



const validateCampground=(req,res,next)=>{                      //THIS FUNCTIONS CANTAINS THE MIDDLE WARE FOR CHECKING THE SERVER SIDE VALIDATION ERROR HANDLING IF WE HAD USED APP.USE IT WOULD RUN EVERYTIME

    
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

//READ
router.get('/', catchAsync(async (req, res,next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));


//FORM FOR CREATING NEW
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})


//REQUEST SERVING FORM FOR CREATE NEW CAMPGROUND
router.post('/', validateCampground, catchAsync(async (req, res,next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))


//READ SINGLE 
router.get('/:id', catchAsync(async (req, res,next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');  //HERE reviews as we have used in schema of campground
    
    res.render('campgrounds/show', { campground });
}));



//FORM FOR UPDATING
router.get('/:id/edit', catchAsync(async (req, res,next) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))



//REQUES SERVING UPDATE FORM
router.put('/:id', validateCampground,catchAsync(async (req, res,next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });  //HERE THIS ... IS SPREADING THE INFO WE HAVE GOT FROM FORM AS REQ.BODY
    res.redirect(`/campgrounds/${campground._id}`)
}));



//DELETE
router.delete('/:id', catchAsync(async (req, res,next) => {   //CATCHASYNC WILL HANDLE THE ERRORS WHICH ACCURR AT SERVER SIDE
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))


module.exports=router;