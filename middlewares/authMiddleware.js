const jwt=require("jsonwebtoken");

module.exports=(req,res,next)=>{
    try {
        const token=req.headers["authorization"].split(" ")[1];
        jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
            if(err){
                return res.status(401).send({
                    message:"Auth fail",
                    success:false,
                    err
                })
            }
            else{
                req.body.userId=decoded.id;
                next();
            }
        })
    } catch (error) {
        res.status(401).send({
            message:"Auth fail",
            success:false,
            error
        })  
    }
}