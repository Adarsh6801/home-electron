
const { request, response } = require('express')
const User=require('../model/userModel')


module.exports={

    sessionUser:async (req,res,next)=>{
        try{
            const session=req.session.userLogin
            if(session){

                const userId=req.session.userId
                console.log(userId);
                const user= await User.findById(userId)
                
                const banned=user.status
                console.log(banned);
                if(banned==true){
                    request.session.userLogged=false
                    response.redirect('/')
                }else{
                    next()
                }
            }else{
                res.redirect('/signin')
            }

        }catch(error){
            
            console.log(error.message);
        }
    },
    checkCheckout:(req,res)=>{
        try{

        }catch{
            
        }
    },
    sessionAdmin:(req,res,next)=>{
        try{
            const session=req.session.adminLogged
            if(session){
                next()
            }else{
                res.redirect('/admin/adminlogin')
            }
        }catch(err){
            console.log(err.message);
        }
    }

}


