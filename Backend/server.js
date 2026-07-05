const express=require('express')
const app=express()
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const authRoutes=require('../routes/auth.routes')
const profileRoutes=require('../routes/profile.routes')
const ConnectDB=require('../config/database')


dotenv.config();



ConnectDB();



app.use(express.json())
app.use(express.urlencoded({extended:true}))



app.use('/auth',authRoutes)
app.use('/profile',profileRoutes)




app.listen(5000,()=>{
    console.log('Server is running on port 5000')
})

