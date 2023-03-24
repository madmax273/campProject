const express = require('express');
const router=express.Router({mergeParams:true});   //FOR USING THE ROUTING{ HERE mergeparams:true is used to merge the parametres in campqrounds req body as we have cganged the routes for bot reviews and campgrounds here if we dont do so the we will not be able to get the params of the campground's req body and so we got error campground not find as we are trying to access some property of campgrounds req body but we dont have it so we do mergeparams:true to merge campgrounds req body with review req body}
const catchAsync=require('../utils/catchAsync');         //FOR ACQUIRING THE CATCHASYNC WRAPPER FUNCTION TO CATCH THE ERROR 
const ExpressError=require('../utils/expressError');     //For ACQUIRING THE ERROR HANDELER CLASS WHICH WE HAD MADE
const Campground = require('../models/campground');      //For including the BOILERPLATE OF HTML

const Review=require('../models/review');                      //FOR REQUIRING THE REVIEW MODEL THAT WE CREATED TO INTEGRATE THE CAMPGROUNDS WITHIN IT AS A REFERENCE ID
const {reviewSchema}=require('../Schemas');          //FOR REQUIRING THE SCHEMA THAT WE HAVE CREATED FOR DOING THE SERVER SIDE VALIDATION



const validateReview=(req,res,next)=>{                      //THIS FUNCTIONS CANTAINS THE MIDDLE WARE FOR CHECKING THE SERVER SIDE VALIDATION ERROR HANDLING FOR REVIEWS IF WE HAD USED APP.USE IT WOULD RUN EVERYTIME

    
    const {error}=reviewSchema.validate(req.body);          //VALIDATING THAT THE DATA FOR EVERY CONTENT IS PRESENT IN THE REQ BODY
    if(error){                                                  //IF ANY ERROR IS PRESENT IT WILL BE RECTIFIED AND THE 
        const msg=error.details.map(el=>el.message).join(',')   //TO MAKE THE ERROR INTO A SINGLE STRING
        throw new ExpressError(msg,400)                         //CONTROL WILL BE SENT TO OUR ERROR HANDLER
    }
    else
    { 
        next();                                                 //IF NO ERROR THEN THE CONTROL WILL BE SENT TO THE NEXT ROUTE HANDELER AS WE HAVE USED NEXT() HERE SINCE THIS IS FOR REVIEWS IF NO ERRORS ARE FIND IT WILL GO TO POST ROUTE SEE BELOW 
    }
}

//POST REQUEST FOR SUBMITTING THE BODY OF THE REVIEW TAHT WE GET FROM SHOW PAGE OG CAMPGROUNDS
router.post('/',validateReview,catchAsync(async(req,res,next)=>{
    const campground=await Campground.findById(req.params.id);
    const review=new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
    }))
    
    //DELETE REQUEST FOR DELETING A REVIEW AS WELL AS ITS REFERENCE IN THE CAMPGROUNDS
    router.delete('/:reviewId',catchAsync(async(req,res)=>{
        const {id,reviewId}=req.params;
        await Campground.findByIdAndUpdate(id,{ $pull:{reviews:reviewId}});     //TO DELETE THE REFERNCE OF A PARTICULAR REVIEW IN CAMPGROUND (HERE AS WE ARE USING findByIdAndUpdate IT GIVES US DEPRECATION ERROR SEE STACKOVERFLOW)
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/campgrounds/${id}`);
    }))


    module.exports=router;