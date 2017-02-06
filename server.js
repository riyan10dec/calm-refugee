
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var _ = require('underscore')
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User = require('./App/Models/User'); // get our mongoose model
var Subscriber= require('./App/Models/Subscriber');
var nodemailer = require("nodemailer")
var smtpTransport = require('nodemailer-smtp-transport');

var app = express();
var transport = nodemailer.createTransport((
    {
        service: 'Gmail',
        auth: {
            user: config.forgotPasswordSender,
            pass: config.forgotPasswordPass
        }
    }));
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.createConnection(config.database);
mongoose.connect(config.database); // connect to database
app.set('jwtSecret', config.secret); // secret variable

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// API ROUTES -------------------

// get an instance of the router for api routes
var apiRoutes = express.Router();
var apiRoutesEvent = express.Router();

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function (req, res) {
    // find the user
    User.findOne({
        id: req.body.id
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.', redirect: '/signin' });
        } else if (user) {
            // check if password matches
            if (user.password !== req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong password.', redirect: '/signin' });
            } else {
                // if user is found and password is right
                // create a token
                var token = jwt.sign(user._id, app.get('jwtSecret'), {});

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }

        }

    });
});

// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function (req, res) {
    res.json({ message: 'Welcome to the coolest API on earth!' });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function (req, res) {
    User.find({}, function (err, users) {
        res.json(users);
    });
});

apiRoutes.post('/signin', function (req, res) {

    if (req.body.loginOpt === "native") {
        User.findOne({
            id: req.body.id,
            password: req.body.password
        }, function (err, users) {
            if (err) throw err;
            else if (!users) res.json({
                success: false,
                message: 'Wrong username or password',
                token: null
            });
            else {
                var token = jwt.sign(users.id, app.get('jwtSecret'), {});
                res.json({
                    success: true,
                    message: '',
                    token: token
                });
            }
        });
    }
    else {
        if (req.body.loginOpt === "fb") {
            User.findOne({
                id: req.body.id,
                $or: [{
                    fb:
                    {
                        id: req.body.id,
                        access_token: req.body.token
                    }
                },
                    {
                        gplus:
                        {
                            id: req.body.id,
                            token: req.body.token
                        }
                    }
                ]
            }, function (req, res) {
                var token = jwt.sign(User, app.get('jwtSecret'), {});
                res.json({
                    success: true,
                    message: '',
                    token: token
                });
            });
        }
    }
});

apiRoutes.post('/signout', function (req, res) {
    res.json({
        success: true,
        message: "Logout Success",
        token: null,
        id: '',
        password: ''
    });
});

apiRoutes.post('/signup', function (req, res) {
    var validate = true, errMsg;
    if (req.body.id === undefined) {
        validate = false;
        errMsg = 'ID can\'t empty'
    }
    if (req.body.password === undefined) {
        validate = false;
        errMsg = 'Password can\'t empty'
    }
    if (req.body.name === undefined) {
        validate = false;
        errMsg = 'Name can\'t empty'
    }
    if (req.body.phone === undefined) {
        validate = false;
        errMsg = 'Phone can\'t empty'
    }
    if (req.body.gender === undefined || req.body.gender !== 'Male' || req.body.gender !== 'Female') {
        validate = false;
        errMsg = 'Wrong gender'
    }
    if (req.body.email === undefined) {
        validate = false;
        errMsg = 'Email can\'t empty'
    }
    if (!validate)
        res.json({ success: false, message: errMsg });
    else {
        User.findOne({
            $or: [{ id: req.body.id, },
                { email: req.body.email }]
        }, function (err, user) {
            if (err) throw err;
            else if (user) {
                if (user.id === req.body.id)
                    res.json({
                        success: false,
                        message: 'This UserID is not available'
                    });
                else if (user.email === req.body.email)
                    res.json({
                        success: false,
                        message: 'This email is not available'
                    });
            }
            else {
                var newUser =
                    {
                        id: req.body.id,
                        password: req.body.password,
                        name: req.body.name,
                        phone: req.body.phone,
                        gender: req.body.gender,
                        email: req.body.email
                    };
                User.collection.insert(newUser);
                res.json({ success: true, message: 'User signed up' });
            }
        });
    }
});
apiRoutes.post('/subscribe', function (req, res){
    var newSubscriber =
                    {
                        email: req.body.email,
                        subscribeDate: new Date()
                    };
                Subscriber.collection.insert(newSubscriber);
                res.redirect('file:///Users/riyan/Downloads/Eventory%20Web/index.html');
});
app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})
apiRoutes.get('/findaccount/:id/:email', function (req, res) {
    User.find({
        $or: [{ id: req.params.id },
            { email: req.params.email }]
    }, function (err, users) {
        if (err) throw err;
        else
            res.json({
                success: true,
                users: users
            });
    });

});

apiRoutes.get('/forgotpassword/:id/:email', function (req, res) {
    User.findOne({ id: req.params.id }, function (err, user) {
        if (err) throw err;
        else {
            var passToken = mongoose.Types.ObjectId();
            try {
                user.update(
                    { forgotPasswordToken: passToken }
                    , function (err, count) {
                        if (err) throw err;
                        else {
                            //sending verification code via email
                            transport.sendMail({
                                from: config.forgotPasswordSender,
                                to: req.params.email,
                                subject: config.subject,
                                text: config.forgotPasswordBody.replace('[code]',
                                    config.domain
                                    + ':'+port
                                    + '/api' 
                                    +'/' + config.resetPasswordRoute
                                    + '/' + req.params.id
                                    + '/' + passToken)
                            }, function (err, info) {
                                if (err) throw err;
                                else {
                                    res.json({
                                        success: true
                                    });
                                }
                            });
                        }
                    });
            } catch (e) {
                res.json({
                    success: false,
                    message: 'Error : ' + e
                });
            }

        }
    });
});

apiRoutes.get('/resetpassword/:id/:passToken', function (req, res) {
    User.findOne({
        id: req.params.id,
        passforgotPasswordToken: req.params.passToken
    }, function (err, user) {
        if (err) throw err;
        if (!user) res.json({
            success: false,
            message: 'Wrong user or password token',
            redirect: null
        });
        else
            res.json({
                success: true,
                message: 'Reset password success',
                redirect: 'newPassword',
                forgotPasswordToken: req.params.passToken
            });
    });
});

apiRoutes.post('/newpassword', function (req, res) {
    User.findOne({
        id: req.body.id,
        forgotPasswordToken: req.body.forgotPasswordToken
    }, function (err, user) {
        if (err) throw err;
        else {
            user.update(
                { password: req.body.newPasword },
                function (err, count) {
                    if (err) throw err;
                    else
                        res.json({
                            success: true,
                            message: 'New password has been set'
                        });
                });
        }
    });
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);
app.use('/api', apiRoutesEvent);
// use morgan to log requests to the console
app.use(morgan('dev'));

/************
 *MIDDLEWARE*
 ************/
apiRoutesEvent.use(function (req, res, next) {
    var restrictedRoute = config.restrictedRoute.split(' ');
    if (! _.contains(restrictedRoute, req.path.split('/')[2])) return next();

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.authorization;
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, app.get('jwtSecret'), function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {
        // if there is no token
        // return an error
        res.send({ redirect: '/signin' });
    }
});

/***************************
 *Main Function using Token*
 ***************************/
var categoriesRouter = require('./App/Controllers/CategoriesController');
apiRoutes.use('/', categoriesRouter);
var eventRouter = require('./App/Controllers/EventController');
apiRoutes.use('/', eventRouter);
var createEventRouter = require('./App/Controllers/CreateEventController');
apiRoutes.use('/', createEventRouter);
var profilesRouter = require('./App/Controllers/ProfilesController');
apiRoutes.use('/', profilesRouter);
//require('./App/Controllers/CategoriesController')(apiRoutesEvent);

app.get('/', function (req, res) {
});
app.listen(port);
console.log('Magic happens at http://localhost:' + port);