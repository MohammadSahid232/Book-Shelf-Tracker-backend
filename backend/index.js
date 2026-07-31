const http = require("http");

let books = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', status: 'finished', rating: 4 },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', status: 'reading', rating: null },
    { id: 3, title: '1984', author: 'George Orwell', status: 'want to read', rating: null }
];

let nextId = 4;

const server = http.createServer((req, res) => {
    // Enable CORS for frontend connection
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
    }

    res.setHeader("Content-Type", "application/json");

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    if (req.method === "GET" && pathname === "/") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.end("Your server is running");

    } else if (req.method === "GET" && pathname === "/api/books") {
        const statusFilter = parsedUrl.searchParams.get("status");
        let filteredBooks = books;
        if (statusFilter) {
            filteredBooks = books.filter(b => b.status.toLowerCase() === statusFilter.toLowerCase());
        }
        res.statusCode = 200;
        res.end(JSON.stringify(filteredBooks));

    } else if (req.method === "GET" && pathname.startsWith("/api/books/")) {
        const id = parseInt(pathname.split("/").pop());
        const book = books.find(b => b.id === id);
        if (!book) {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: "Book not found" }));
        } else {
            res.statusCode = 200;
            res.end(JSON.stringify(book));
        }

    } else if (req.method === "POST" && pathname === "/api/books") {
        let body = "";
        req.on("data", (chunk) => body += chunk.toString());
        req.on("end", () => {
            try {
                const bookData = JSON.parse(body);
                if (!bookData.title || bookData.title.trim() === "") {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ errors: [{ msg: "Title is required", path: "title" }] }));
                    return;
                }
                const newBook = {
                    id: nextId++,
                    title: bookData.title,
                    author: bookData.author || "Unknown Author",
                    status: bookData.status || "want to read",
                    rating: bookData.rating || null
                };
                books.push(newBook);
                res.statusCode = 201;
                res.end(JSON.stringify(newBook));
            } catch (err) {
                res.statusCode = 400;
                res.end(JSON.stringify({ message: "Invalid JSON input" }));
            }
        });

    } else if (req.method === "PATCH" && pathname.startsWith("/api/books/")) {
        const id = parseInt(pathname.split("/").pop());
        let body = "";
        req.on("data", (chunk) => body += chunk.toString());
        req.on("end", () => {
            try {
                const book = books.find(b => b.id === id);
                if (!book) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ message: "Book not found" }));
                    return;
                }
                const updates = JSON.parse(body);
                if (updates.status !== undefined) book.status = updates.status;
                if (updates.rating !== undefined) book.rating = updates.rating;
                if (updates.title !== undefined) book.title = updates.title;
                if (updates.author !== undefined) book.author = updates.author;
                res.statusCode = 200;
                res.end(JSON.stringify(book));
            } catch (err) {
                res.statusCode = 400;
                res.end(JSON.stringify({ message: "Invalid JSON input" }));
            }
        });

    } else if (req.method === "DELETE" && pathname.startsWith("/api/books/")) {
        const id = parseInt(pathname.split("/").pop());
        const index = books.findIndex(b => b.id === id);
        if (index === -1) {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: "Book not found" }));
        } else {
            books.splice(index, 1);
            res.statusCode = 204;
            res.end();
        }

    } else if (req.method === "POST" && pathname === "/api/register") {
        let body = "";
        req.on("data", (chunk) => body += chunk.toString());
        req.on("end", () => {
            try {
                const registerData = JSON.parse(body);
                const errors = [];
                if (!registerData.email || !registerData.email.includes("@")) {
                    errors.push({ msg: "Please provide a valid email address", path: "email" });
                }
                if (!registerData.password || registerData.password.length < 6) {
                    errors.push({ msg: "Password must be at least 6 characters long", path: "password" });
                }
                if (registerData.password !== registerData.confirmPassword) {
                    errors.push({ msg: "Passwords do not match", path: "confirmPassword" });
                }

                if (errors.length > 0) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ errors }));
                } else {
                    res.statusCode = 201;
                    res.end(JSON.stringify({ message: "Registration successful!" }));
                }
            } catch (err) {
                res.statusCode = 400;
                res.end(JSON.stringify({ message: "Invalid JSON input" }));
            }
        });

    } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Not Found" }));
    }
});

server.listen(5000, "127.0.0.1", () => {
    console.log("Server running at http://localhost:5000/");
});