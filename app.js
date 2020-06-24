if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const express=require('express');
const app=express();
const expressLayouts=require('express-ejs-layouts');
const indexRoute=require('./routes/indexRoute');
const authorRoute=require('./routes/authorRoute');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');


// ----viewEngin--------
app.set('view engine','ejs');
app.set('views',__dirname+'/views');
app.set('layout','layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({limit:'10mb',extended:false}));

// ----------------middleware-----------
app.use('/',indexRoute);
app.use('/authors',authorRoute);

// ----------------------database-----------------
mongoose.connect(process.env.DB_CONNECTION,
    {useNewUrlParser:true,useUnifiedTopology: true});
    const db=mongoose.connection
    db.on('error',error=>console.error(error));
    db.once('open',()=>console.log("DB connected"));

// ---------------------Serverlisten------------    
app.listen(process.env.PORT || 3000,()=>{
    console.log("server up and running");
});

