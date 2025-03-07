const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, "secretkey", { expiresIn: "1h" });
  return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Authorization token required" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const username = decoded.username;

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }

    books[isbn].reviews = books[isbn].reviews || {};
    books[isbn].reviews[username] = review;
    return res.status(200).json({
      message: "Review added/updated successfully",
      reviews: books[isbn].reviews,
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Authorization token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "secretkey");
    const username = decoded.username;

    if (
      !books[isbn] ||
      !books[isbn].reviews ||
      !books[isbn].reviews[username]
    ) {
      return res.status(404).json({ message: "Review not found" });
    }

    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
