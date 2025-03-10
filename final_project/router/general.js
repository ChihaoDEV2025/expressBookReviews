const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Original endpoints (Tasks 1-5)
// -------------------------------

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if a user with the same username already exists in the array
  if (users.some((user) => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Push new user into the users array
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(
    (book) => book.author === author
  );

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter(
    (book) => book.title === title
  );

  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book review based on ISBN
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn] && books[isbn].reviews) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
});

// ---------------------------------------------

// Task 10: Get the book list available in the shop using async/await
public_users.get("/async", async (req, res) => {
  try {
    const allBooks = await new Promise((resolve, reject) => {
      resolve(books);
    });
    return res.status(200).send(JSON.stringify(allBooks, null, 2));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Task 11: Get book details based on ISBN using async/await
public_users.get("/async/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book not found");
      }
    });
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Task 12: Get book details based on author using async/await
public_users.get("/async/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const booksByAuthor = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(
        (book) => book.author === author
      );
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found for this author");
      }
    });
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Task 13: Get book details based on title using async/await
public_users.get("/async/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
    const booksByTitle = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(
        (book) => book.title === title
      );
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject("No books found with this title");
      }
    });
    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

module.exports.general = public_users;
