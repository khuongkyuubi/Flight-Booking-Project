export const admin ={
    checkAdmin:function (req,res,next) {
        console.log(req.body.role);
        if(req.body.role == 'admin'){
            next()
        }else{
            res.redirect('/list/book')
        }
    }
}