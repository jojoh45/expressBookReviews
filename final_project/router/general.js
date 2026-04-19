const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
}

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!doesExist(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: `${username} successfully registered. Now you can login` });
        } else {
            return res.status(404).json({ message: `${username} already exists!` });
        }
    }
    return res.status(404).json({ message: `Unable to register ${username}` });
});

// Get the book list available in the shop (async-await)
public_users.get('/', async (req, res) => {
    try {
        const allBooks = await new Promise((resolve, reject) => {
            if (books && Object.keys(books).length > 0) {
                resolve(books);
            } else {
                reject(new Error("No books found"));
            }
        });
        return res.status(200).json(allBooks);
    } catch (error) {
        return res.status(404).json({ 
            message: "No books are currently available in the shop.",
            details: error.message 
        });
    }
});

// Get book details based on ISBN (async-await)
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await new Promise((resolve, reject) => {
            const result = books[isbn];
            if (result) {
                resolve(result);
            } else {
                reject(new Error(`No book found for ISBN: ${isbn}`));
            }
        });
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ 
            message: `No book was found with ISBN: ${isbn}. Please verify the ISBN is correct.`,
            details: error.message 
        });
    }
});

// Get book details based on author (async-await)
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const matchingBooks = await new Promise((resolve, reject) => {
            const result = Object.values(books).filter(book => book.author === author);
            if (result.length > 0) {
                resolve(result);
            } else {
                reject(new Error(`No books found for author: ${author}`));
            }
        });
        return res.status(200).json(matchingBooks);
    } catch (error) {
        return res.status(404).json({ 
            message: `No books were found for author: "${author}". Please ensure the author's name is spelled correctly.`,
            details: error.message 
        });
    }
});

// Get all books based on title (async-await)
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const matchingBooks = await new Promise((resolve, reject) => {
            const result = Object.values(books).filter(book => book.title === title);
            if (result.length > 0) {
                resolve(result);
            } else {
                reject(new Error(`No books found for title: ${title}`));
            }
        });
        return res.status(200).json(matchingBooks);
    } catch (error) {
        return res.status(404).json({ 
            message: `No books were found with the title: "${title}". Please ensure the title is spelled correctly.`,
            details: error.message 
        });
    }
});

// Get book review (async-await)
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const reviews = await new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book && book.reviews && Object.keys(book.reviews).length > 0) {
                resolve(book.reviews);
            } else {
                reject(new Error(`No reviews found for ISBN: ${isbn}`));
            }
        });
        return res.status(200).json(reviews);
    } catch (error) {
        return res.status(404).json({ 
            message: `No reviews found for ISBN: ${isbn}. Please verify the ISBN is correct.`,
            details: error.message 
        });
    }
});

module.exports.general = public_users;
