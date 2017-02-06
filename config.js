module.exports = {
    'secret': 'konekindosecret',
    'database': 'mongodb://rta:Password95@ds019826.mlab.com:19826/heroku_rtc440dq',//'mongodb://localhost:27017/local', //mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]] 'mongodb://ds019826.mlab.com:19826/heroku_rtc440dq'
    'domain': 'calm-refuge-86245.herokuapp.com',
    'forgotPasswordSubject': 'Forgot Password',
    'forgotPasswordBody': 'Please click this link to reset your password : [code]',
    'forgotPasswordSender': 'dimakan.harimau@gmail.com',
    'forgotPasswordPass': 'bandung123',
    'emailHost': '',
    'emailPort': '',
    'resetPasswordRoute': 'resetpassword',
    'restrictedRoute': ''
};