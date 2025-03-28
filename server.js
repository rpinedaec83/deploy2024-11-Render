const express = require('express');
const cookieSession = require('cookie-session');

const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 8089;


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(
    cookieSession({
        name:'auth-session',
        keys:[process.env.COOKIE_SECRET],
        httpOnly:true
    })
)


app.get('/',(req,res)=>{
    res.send({message:"Bienvenido a mi API"})
});
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

const db = require('./app/models');
const Role = db.role;
db.mongoose.set('strictQuery', false);
db.mongoose.connect(process.env.MONGOURI,{}).then(()=>{
    console.log("Base de datos conectada");
    init()
}).catch((err)=>{
    console.error(err);
    process.exit();
})

function init(){
    Role.estimatedDocumentCount((err,count)=>{
        if(!err & count === 0){
            new Role({
                name: "user"
            }).save((err)=>{
                if(err){
                    console.log("Error al crear el rol usuario")
                }
                console.log("Rol usuario creado")
            });
            new Role({
                name: "moderator"
            }).save((err)=>{
                if(err){
                    console.log("Error al crear el rol moderator")
                }
                console.log("Rol moderator creado")
            });
            new Role({
                name: "admin"
            }).save((err)=>{
                if(err){
                    console.log("Error al crear el rol admin")
                }
                console.log("Rol admin creado")
            });
        }
    })
}



app.listen(PORT, ()=>{
    console.log(`Escuchando el puerto ${PORT}`)
})