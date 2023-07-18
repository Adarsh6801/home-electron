const createEror=require('http-errors');
const express=require('express');
const cookieParser =require('cookie-parser');
const path=require('path');

var bodyParser = require('body-parser')
// const logger = require('morgan');
const mongoose=require('mongoose');
const multer=require('multer')
const session=require('express-session');

const  nocache=require('nocache')





const usersRouter=require('./routes/users');
const adminRouter=require('./routes/admin');
const ejs=require('ejs');
const { ppid } = require('process');

const app=express();
// const router=express.Router();

app.set('views',path.join(__dirname,'views'));

app.use(bodyParser.json())
app.set('view engine','ejs');
// app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./public/images/productImages/");
    },
    filename:(req,file,cb)=>{
        cb(null,file.fieldname+"_"+Date.now() +path.extname(file.originalname))
        // console.log(file.fieldname+Date.now()+path.extname(file.originalname))
    },
});

app.use(multer({storage: storage}).single("image"))

const oneday=1000*60*60*24
app.use(session({
    secret:'secret-key',
    resave:true,
    saveUninitialized:true,
    cookie:{maxAge:oneday},
}
))
app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(nocache());
app.use('/',usersRouter);
app.use('/admin',adminRouter);
mongoose.connect("mongodb+srv://ajnaskp67:W25SduyAT27lcr0s@cluster0.ykjfftm.mongodb.net/?retryWrites=true&w=majority",()=>{
    console.log("Mogodb is connected");
},
e=>console.error(e)
)
//09sBQW7NRXgSmxUH          mongodb atlas adarsh password







const PORT =3000;
app.listen(PORT, console.log("Server don start for port: " + PORT))