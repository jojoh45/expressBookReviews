const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:1500";

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

// ---- Internal data routes (Axios calls these) ----

public_users.get('/data/books', (req, res) => {
    return res.status(200).json(books);
});

public_users.get('/data/books/:isbn', (req, res) => {
    const book = books[req.params.isbn];
    if (book) return res.status(200).json(book);
    return res.status(404).json({ message: "Book not found" });
});

public_users.get('/data/books/author/:author', (req, res) => {
    const result = Object.values(books).filter(book => book.author === req.params.author);
    if (result.length > 0) return res.status(200).json(result);
    return res.status(404).json({ message: "No books found for this author" });
});

public_users.get('/data/books/title/:title', (req, res) => {
    const result = Object.values(books).filter(book => book.title === req.params.title);
    if (result.length > 0) return res.status(200).json(result);
    return res.status(404).json({ message: "No books found for this title" });
});

public_users.get('/data/books/:isbn/reviews', (req, res) => {
    const book = books[req.params.isbn];
    if (book && book.reviews && Object.keys(book.reviews).length > 0) {
        return res.status(200).json(book.reviews);
    }
    return res.status(404).json({ message: "No reviews found" });
});

// ---- Public routes using Axios ----

// Get all books (Axios + async-await)
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/data/books`);
        if (!response.data || Object.keys(response.data).length === 0) {
            return res.status(404).json({ message: "No books are currently available in the shop." });
        }
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            message: "Unable to retrieve the book list. Please try again later.",
            details: error.message
        });
    }
});

// Get book by ISBN (Axios + async-await)
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`${BASE_URL}/data/books/${isbn}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({
            message: `No book was found with ISBN: ${isbn}. Please verify the ISBN is correct.`,
            details: error.message
        });
    }
});

// Get books by author (Axios + async-await)
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const response = await axios.get(`${BASE_URL}/data/books/author/${encodeURIComponent(author)}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({
            message: `No books were found for author: "${author}". Please ensure the author's name is spelled correctly.`,
            details: error.message
        });
    }
});

// Get books by title (Axios + async-await)
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const response = await axios.get(`${BASE_URL}/data/books/title/${encodeURIComponent(title)}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({
            message: `No books were found with the title: "${title}". Please ensure the title is spelled correctly.`,
            details: error.message
        });
    }
});

// Get book reviews (Axios + async-await)
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`${BASE_URL}/data/books/${isbn}/reviews`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(404).json({
            message: `No reviews found for ISBN: ${isbn}. Please verify the ISBN is correct.`,
            details: error.message
        });
    }
});

module.exports.general = public_users;