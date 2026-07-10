// Book model - in-memory data store
let books = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', status: 'finished', rating: 4 },
    { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', status: 'reading', rating: null },
    { id: 3, title: '1984', author: 'George Orwell', status: 'want to read', rating: null }
];

let nextId = 4;

module.exports = {
    getAll: (status) => {
        if (status) {
            return books.filter(b => b.status === status.toLowerCase());
        }
        return books;
    },

    getById: (id) => books.find(b => b.id === id),

    create: ({ title, author, status, rating }) => {
        const newBook = {
            id: nextId++,
            title,
            author: author || 'Unknown Author',
            status: status || 'want to read',
            rating: rating || null
        };
        books.push(newBook);
        return newBook;
    },

    update: (id, updates) => {
        const book = books.find(b => b.id === id);
        if (!book) return null;
        if (updates.status !== undefined) book.status = updates.status;
        if (updates.rating !== undefined) book.rating = updates.rating;
        if (updates.title !== undefined) book.title = updates.title;
        if (updates.author !== undefined) book.author = updates.author;
        return book;
    },

    delete: (id) => {
        const index = books.findIndex(b => b.id === id);
        if (index === -1) return false;
        books.splice(index, 1);
        return true;
    }
};
