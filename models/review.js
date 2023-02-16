const mongoose=require('mongoose');

const Schema={mongoose};

const reviewSchema={
     body:String,
     rating:Number
}

module.exports=mongoose.model('Review',reviewSchema);