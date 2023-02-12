module.exports=(func)=>{        //catchAsync function 
 
    return (req,res,next)=>{        //This function will execute the func FUNCTION EHICH WE TAKE AS ARGUMENT
        // AND CATCH ANY ERROR WHICH ACCURS IN IT AND THE OUTER FUNCTION WILL RETURN THE ERROR WHICH WILL BE FURTHER PROCEEDED
      func(req,res,next).catch(next);
    }
}
