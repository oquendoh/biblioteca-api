const express = require('express')
const Route = express.Router()
const BookController = require('../controllers/bookController')

Route
    .post('/', BookController.createBook)
    .get('/rent', BookController.getAvailableBooks)
    .put('/:id', BookController.updateBook)
    .delete('/:id', BookController.deleteBook)
    
module.exports = Route
