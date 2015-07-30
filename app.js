
var express = require('express');
var multer  = require('multer');
var bodyParser = require('body-parser');
var users = require('./routes/users');
var fs = require('fs');

var app = express();

// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/uploads'));

// Authorizations to receive calls
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
  next();
});

var done = false;
var uploadID = 0;

// Define home page
app.get('/', function (req, res) {
  res.send('Servidor da Plaraforma Beauty!');
});

// Static to access images
app.use('/uploads', express.static(__dirname + '/uploads'));

// Define API
app.get('/api/users', users.findAll);
app.get('/api/users/:id', users.findByID);
app.put('/api/users/:id', users.updateUser);
app.post('/api/users', users.addUser);

// Upload photo to database
app.post('/api/users/photo/:id', (multer({
    dest: './uploads/',

    changeDest: function(dest, req, res) {
        var newDestination = dest + req.params.id + "/";
        var stat = null;
        try {
            stat = fs.statSync(newDestination);
        } catch (err) {
            fs.mkdirSync(newDestination);
        }
        if (stat && !stat.isDirectory()) {
            throw new Error('Directory cannot be created because an inode of a different type exists at "' + dest + '"');
        }
        return newDestination
    },

    rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, '-') + "_" + Date.now();
    },

    onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...')
    },

    onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path)
        done = true;
        users.addPhotoToDatabase(file);
    }
})), function(req, res) {
    if (done)
    {
        return res.end('OK');
    }
});

app.delete('/api/users/:id', users.deleteUser);

// Define page not found
app.get('*', function(req, res) {
    res.status(404).send('Page not found!');
});


app.listen(3000);
console.log('Listening at http://127.0.0.1:3000');
