const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

const app = express(); 
app.use("/customer", regd_users);

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // If no reviews exist for this ISBN yet, initialize it
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add or modify the review using username as the key
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: `Review for ISBN ${isbn} has been added/updated by ${username}`, reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found for this user" });
    }

    // Only delete the logged-in user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: `Review for ISBN ${isbn} by ${username} has been deleted.` });
});






module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
