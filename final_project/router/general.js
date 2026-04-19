const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:1500";

// Check if a user with the given username already exists
const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
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
        const response = await axios.get(`${BASE_URL}/`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});

// Get book details based on ISBN (async-await)
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book", error: error.message });
    }
});

// Get book details based on author (async-await)
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
});

// Get all books based on title (async-await)
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by title", error: error.message });
    }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`${BASE_URL}/review/${isbn}`);
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching review", error: error.message });
    }
});

module.exports.general = public_users;