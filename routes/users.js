
var mongoose = require('mongoose');
var fs = require('fs');

// Connect to database
mongoose.connect('mongodb://localhost:27017/poc_users');

var Schema = mongoose.Schema;

// Create a schema of the database

var Users = new Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    photo: { type: String }
});

// Generate the model
var UserModel = mongoose.model('Users', Users);

var userImageID = 0;


// Implement the methods
// Need to properly define the return values

exports.findAll = function(req, res)
{
    return UserModel.find().lean().exec(function (err, users) {
        if (!err) {
            return res.end(JSON.stringify(users));
        }
        else {
            return console.log(err);
        }
    });
}

exports.addUser = function(req, res)
{
    var user;

    user = new UserModel({
        name : req.body.name,
        age : req.body.age,
        photo : req.body.photo,
    });

    user.save(function (err, newUser) {
        if (!err) {
            userImageID = newUser._id;
            console.log("Added user " + newUser._id);

            var response = {
                id : userImageID,
                status : 200,
            };

            return res.end(JSON.stringify(response));
        }
        else {
            console.log(err);

            var response = {
                id : 0,
                status : 500,
            };

            return res.end(JSON.stringify(response));
        }
    });
}

exports.addPhotoToDatabase = function(file)
{
    var id = userImageID;
    userImageID = 0;

    return UserModel.findById(id, function (err, user) {
        if (!err) {
            var oldPath = user.photo;
            user.photo = file.path;

            user.save(function (err) {
                if (!err) {
                    try { fs.unlinkSync(String(oldPath)); } catch(e) {}
                    console.log("Added photo " + file.path);
                } else {
                    console.log(err);
                }
            });
        } else {
            console.log(err);
        }
    });
}

exports.updateUser = function(req, res)
{
    var newUser;

    newUser = new UserModel({
        name : req.body.name,
        age : req.body.age,
    });

    console.log(req.body.name);
    console.log(req.body.age);
    console.log(req.body);

    return UserModel.findById(req.params.id, function (err, user) {
        if (!err) {
            user.name = newUser.name;
            user.age = newUser.age;

            user.save(function (err) {
                if (!err) {

                    userImageID = user._id;

                    var response = {
                        status : 200,
                    };

                    console.log("Updated");

                    return res.end(JSON.stringify(response));
                } else {
                    console.log(err);

                    var response = {
                        status : 500,
                    };

                    return res.end(JSON.stringify(response));
                }
            });
        } else {
            console.log(err);

            var response = {
                status : 500,
            };

            return res.end(JSON.stringify(response));
        }
    });
}

exports.deleteUser = function(req, res)
{
    UserModel.findById(req.params.id, function (err, user) {
        if (!err) {
            try { fs.unlinkSync(String(user.photo)); } catch(e) {}

            return UserModel.findById(req.params.id).lean().remove().exec(function (err) {
                if (!err) {
                    console.log("removed");
                    return res.end('OK');
                } else {
                    console.log(err);
                }
            });
        }
        else {
            return console.log(err);
        }
    });
}

exports.findByID = function(req, res)
{
    return UserModel.findById(req.params.id).lean().exec(function (err, user) {
        if (!err) {
            return res.end(JSON.stringify(user));
        }
        else {
            return console.log(err);
        }
    });
}
