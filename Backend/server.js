const express=require('express')
const app=express()
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const cors=require('cors')
const authRoutes=require('./routes/auth.routes')
const profileRoutes=require('./routes/profile.routes')
const surveyRoutes=require('./routes/survey.routes')
const locationRoutes=require('./routes/location.routes')
const { ConnectDB }=require('./config/database')
const { activityMiddleware, markInactiveUsersOffline }=require('./middlewares/activity.middleware')


dotenv.config();



ConnectDB();



app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// Apply activity tracking middleware to all routes
app.use(activityMiddleware)

app.use('/api/auth',authRoutes)
app.use('/api/profile',profileRoutes)
app.use('/api/survey',surveyRoutes)
app.use('/api/location',locationRoutes)




app.listen(5000,()=>{
    console.log('Server is running on port 5000')
})

// Schedule inactivity check - run every minute
setInterval(() => {
    markInactiveUsersOffline();
}, 60 * 1000); // Every minute

