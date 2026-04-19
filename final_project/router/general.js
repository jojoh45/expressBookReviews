const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: `${username} successfully registered. Now you can login`});
        } else {
            return res.status(404).json({message: `${username} already exists!`});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: `Unable to register ${username}`});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const bookISBN = req.params.isbn;

  return res.send(books[bookISBN]);
 });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const matchingBooks = [];

    for (const [key, value] of Object.entries(books)) {
        if (value.author === author) {
            matchingBooks.push(value);
        }
    }

    if (matchingBooks.length > 0) {
        res.send(matchingBooks);
    } else {
        res.send("Author not found");
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const matchingBooks = [];

    for (const [key, value] of Object.entries(books)) {
        if (value.title === title) {
            matchingBooks.push(value);
        }
    }

    if (matchingBooks.length > 0) {
        res.send(matchingBooks);
    } else {
        res.send("Title not found");
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const bookISBN = req.params.isbn;

    if (!bookISBN) {
        res.send("Review could not be found");
    }
    return res.send(books[bookISBN].reviews);
});

module.exports.general = public_users;
