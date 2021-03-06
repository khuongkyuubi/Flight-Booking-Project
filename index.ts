import express from 'express';
import mongoose from "mongoose";
import bodyParser from "body-parser";
import appRoot from "app-root-path";
import {logger} from "./src/logger/winston";
import passport from "./src/middleware/passport"
import errorControllers from "./src/controllers/errorControllers";
import expressLayouts from 'express-ejs-layouts';

const appRootPath = appRoot.path;
import path from "path";
import authRouter from "./src/router/authRouter"
import session from "express-session";
import auth from "./src/middleware/auth";
import productRouter from "./src/router/productRouter";
import adminRouter from "./src/router/adminRouter";
import {admin} from "./src/middleware/admin";
import dotenv from "dotenv";
import createFlightRouter from "./src/router/createFlight.router";

dotenv.config();
import connectDB from "./src/config/db";
import userRouter from "./src/router/userRouter";

const app = express();
const PORT = process.env.PORT || 3000;

// setup body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// setup view engine
app.use(setLayouts);
app.set('view engine', 'ejs');
app.set('views', './src/views');
app.set("layout", path.join("layouts", "layout"));

// set middleware to use layout
function setLayouts(req, res, next) {
    const routes = ["auth", 'user', 'admin', 'flight', 'public'];
    const baseUrl = req.originalUrl.split('/')[1];
    if (routes.includes(baseUrl)) {
        next();
    } else {
        return expressLayouts(req, res, next)
    }
}

// setup static file
app.use('/public', express.static(path.join(appRootPath, "src", 'public')));

// setup using session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60 * 60 * 1000}
}));

// setup passport
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    return res.redirect("/home/booking")
});
app.get('/home', (req, res) => {
    return res.redirect("/home/booking")
});

app.use('/auth', authRouter);
app.use('/home', productRouter);//get in home page
app.use('/flight', createFlightRouter);//get in home page
app.use('/admin', auth.checkAuth, admin.checkAdmin, adminRouter);
app.use('/user', auth.checkAuth, userRouter);


app.post('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/home/booking');
    });
});

// connect DB
connectDB();

app.use((req, res, next) => {
    next('err');
})
app.use(errorControllers.errorRender);

app.listen(PORT, () => {
    console.log(`You are listening on port: ${PORT}`);
});

export {app}