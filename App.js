import express from 'express'
import course from './Routes/courseRoutes.js'
import user from './Routes/userRoutes.js'
import payment from './Routes/paymentRoutes.js'
import {ErrorMiddleware} from './Middlewares/error.js'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'
import otherRoutes from './Routes/otherRoutes.js'
// import bodyParser from 'body-parser'

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(fileUpload({useTempFiles:true}))


app.use(course)
app.use(user)
app.use(payment)
app.use(otherRoutes)


export default app

app.use(ErrorMiddleware)