const userController = require('../controllers/auth.controller')
const {verifySignUp}=require('../middelwares');


module.exports = function(app){

    app.use(function(req,res,next){
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        )
        next();
    })

    app.post("/api/auth/signup",[
        verifySignUp.checkDuplicateUsernameOrEmail, 
        verifySignUp.checkRolesExited],
    userController.signup)

    app.post('/api/auth/signin', userController.signin)

    app.post('/api/auth/signout', userController.signout);

}