import passport from "passport";
import User from "../schemas/User.model";
import LocalStrategy from "passport-local";
import GoogleStrategy from 'passport-google-oauth20';
import bcrypt from 'bcrypt';

passport.use(new LocalStrategy(
   function (username, password, done) {
        User.findOne({username: username}, function (err, user) {
            // console.log(user);
            bcrypt.compare(password, user.password, function(err, result) {
                // result === true
                // console.log(result);
                // console.log(password,'alo',user.password)
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (result) {
                    return done(null, user);
                }
                return done(null, false);

            });
        });
    }
));

//Google login
passport.use(new GoogleStrategy({
        clientID: "974260312324-a8iuqjb0bcdjbak79bgblp1tf9pli5ar.apps.googleusercontent.com",
        clientSecret: "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",
        callbackURL: "http://localhost:3000/auth/google/callback",
        passReqToCallback: true
    },
    async (request, accessToken, refreshToken, profile, done) => {
        try {
            // console.log(profile, 'profile')
            let existingUser = await User.findOne({ 'google.id': profile.id });
            // if user exists return the user
            // console.log(existingUser);
            if (existingUser) {
                return done(null, existingUser);
            }
            // if user does not exist create a new user
            // console.log('Creating new user...');
            const newUser = new User({
                google: {
                    id: profile.id,
                },
                username: profile.emails[0].value,
                password: '1',
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email:profile.emails[0].value
            });
            await newUser.save();
            // console.log(newUser, 'newUser')
            return done(null, newUser);
        } catch (error) {
            return done(null, false)
        }
    }
));

// After login , create session and cookie
passport.serializeUser((user, done) => {
    // user l?? bi???n h???ng ???????c t??? b??n passport.use Stragery ??? tr??n
    done(null, user["_id"])
});

// T???i c??c l???n truy c???p l???n sau, passport s??? ki???m tra xem trong session c?? l??u gi?? tr??? ???? c??i ??? tr??n kh??ng, n???u c?? th?? x??c minh l?? ???? ????ng nh???p th??nh c??ng

passport.deserializeUser(async (userID, done) => {
    const user = await User.findOne({_id: userID});
    // console.log(user,'userID'+ userID);
    if (user) {
        // N???u t??m ra ???????c user th?? g???n n?? v??o trong req.user
        done(null, user);
    } else {
        console.log("User not found!")
    }
})

export default passport;