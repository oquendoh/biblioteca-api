require('dotenv').config()
const modelBooks = require('../models/book')

module.exports = {
    getBooks: (req, res) => {
        const numPerPage = parseInt(req.query.limit) || null
        const activePage = req.query.page || 1
        const beginData = numPerPage * (activePage - 1)
        const sort = req.query.sort || 'released_at'
        const order = req.query.order || 'DESC'
        const search = req.query.search || null
        const genre = req.query.genre || null
        const queryLimit = (numPerPage !== null) ? `LIMIT ${beginData},${numPerPage}` : ''
        const querySearch = (search !== null) ? `AND book.title LIKE '%${search}%'` : ''
        const queryGenre = (genre !== null) ? `AND genre.genre LIKE '%${genre}%'` : ''

        modelBooks.getBooks(queryLimit, sort, order, querySearch, queryGenre)
            .then(result => res.json({
                status: 200,
                currentPage: activePage,
                limit: numPerPage,
                sort,
                order,
                search,
                result
            }))
            .catch(err => console.log(err))
    },
    getABook: (req, res) => {
        const id = req.params.id
        modelBooks.getABook(id)
            .then(result => {
                // Checking if book does not exist
                if (result[0] === undefined) {
                    return res.status(400).send({
                        status: 400,
                        id,
                        message: 'The book does not exist'
                    })
                }
                res.json({
                    status: 200,
                    id: id,
                    message: 'Book successfully retrieved',
                    result
                })
            })
            .catch(err => console.log(err))
    },
    createBook: (req, res) => {
        // const [year, month, day] = req.body.released_at
        const data = {
            title: req.body.title,
            desc: req.body.desc,
            image_url: req.body.image,
            released_at: req.body.released_at,
            genre: req.body.genre,
            available: parseInt(req.body.available)
        }

        modelBooks.createBook(data)
            .then(result => res.send({
                status: 200,
                message: 'Book has successfully added!',
                data
            }))
            .catch(err => console.log(err))
    },
    updateBook: (req, res) => {
        const data = {
            title: req.body.title,
            image_url: req.body.image,
            genre: req.body.genre,
            desc: req.body.desc
        }

        const id = req.params.id

        modelBooks.getABook(id)
            .then(result => {
                if (result.length !== 0) {
                    return modelBooks.updateBook(data, id)
                        .then(result => res.json({
                            status: 200,
                            message: 'Book has successfully updated',
                            id,
                            data
                        }))
                        .catch(err => console.log(err))
                } else {
                    return res.status(400).send({
                        status: 400,
                        id,
                        message: 'Book does not exist'
                    })
                }
            })
    },
    deleteBook: (req, res) => {
        const id = req.params.id
        modelBooks.getABook(id)
            .then(result => {
                if (result.length !== 0) {
                    return modelBooks.deleteBook(id)
                        .then(result => res.send({
                            status: 200,
                            id: id,
                            message: 'Book has been deleted',
                        }))
                        .catch(err => console.log(err))
                } else {
                    return res.status(400).send({
                        status: 400,
                        id,
                        message: 'Book does not exist'
                    })
                }

            })
    },
    getAvailableBooks: (req, res) => {
        const numPerPage = parseInt(req.query.item) || 12
        const activePage = req.query.page || 1
        const beginData = numPerPage * (activePage - 1)
        const sort = req.query.sort || 'released_at'
        const order = req.query.order || 'DESC'
        const search = req.query.search || null
        const querySearch = (search !== null) ? `AND book.title LIKE '%${search}%'` : ''

        modelBooks.getAvailableBooks(beginData, numPerPage, sort, order, querySearch)
            .then(result => res.json({
                status: 200,
                message: 'This is the lists of available books',
                currentPage: activePage,
                limit: numPerPage,
                sort,
                order,
                search,
                result
            }))
            .catch(err => console.log(err))
    },
    rentBook: async (req, res) => {
        const data = {
            available: 0
        }
        const id = req.params.id
        const history = {
            book_id: id,
            user_id: parseInt(req.body.user_id),
            rent_at: new Date(Date.now()),
            expired_at: new Date(Date.now() + 604800000 * 2),
            return_at: 'false'
        }
        modelBooks.bookAvailable(id)
            .then(result => {
                if (res.length !== 0) {
                    return modelBooks.rentHistory(history)
                        .then(result => {
                            return modelBooks.rentBook(data, id)
                                .then(result => res.send({
                                    status: 200,
                                    id,
                                    message: 'Book has successfully rented'
                                }))
                                .catch(err => console.log(err))
                        })
                } else {
                    return res.status(400).send({
                        status: 400,
                        id,
                        message: 'The book has already borrowed by someone else'
                    })
                }
            })
    },
    getAllRentedBook: (req, res) => {
        modelBooks.getAllRentedBook()
            .then(result => res.json({
                status: 200,
                totalData: result.length,
                message: 'This is the lists of unavailable books',
                result
            }))
            .catch(err => console.log(err))
    },
    returnBook: (req, res) => {
        const data = {
            available: 1
        }
        const id = req.params.id
        const history = {
            book_id: id,
            user_id: req.body.user_id,
        }
        const return_at = {
            return_at: new Date(Date.now())
        }
        modelBooks.bookNotAvailable(id)
            .then(result => {
                if (result.length !== 0) {
                    return modelBooks.returnHistory(history, return_at)
                        .then(result => {
                            return modelBooks.returnBook(data, id)
                                .then(result => res.json({
                                    status: 200,
                                    id,
                                    message: 'Book has successfully returned'
                                }))
                                .catch(err => console.log(err))
                        })

                } else {
                    return res.status(400).send({
                        status: 400,
                        id,
                        message: 'The Book is not borrowed by anyone, why are you trying to prank me ?'
                    })
                }
            })
    },
    getGenres: (req, res) => {
        modelBooks.getGenres()
            .then(result => res.json({
                status: 200,
                totalData: result.length,
                message: 'This is the lists of genres',
                result
            }))
            .catch(err => console.log(err))
    },
    insertGenre: (req, res) => {
        const data = {
            genre: req.body.genre
        }
        modelBooks.genreCheck(data)
            .then(result => {
                if (result.length === 0) {
                    return modelBooks.insertGenre(data)
                        .then(result => res.json({
                            status: 200,
                            message: 'Genre has successfully added',
                            data
                        }))
                        .catch(err => console.log(err))
                } else {
                    return res.status(400).send({
                        status: 400,
                        message: 'The genre is already exist',
                        data
                    })
                }
            })


    },
    updateGenre: (req, res) => {
        const data = {
            genre: req.body.genre
        }
        const id = req.params.id
        modelBooks.genreCheckById(id)
            .then(result => {
                if (result.length !== 0) {
                    return modelBooks.updateGenre(data, id)
                        .then(result => res.json({
                            status: 200,
                            message: 'Genre has successfully updated',
                            id,
                            data
                        }))
                        .catch(err => console.log(err))
                } else {
                    return res.status(400).send({
                        status: 400,
                        id,
                        genre,
                        message: 'Genre does not exist'
                    })
                }
            })

    },
    deleteGenre: (req, res) => {
        const id = req.params.id
        modelBooks.genreCheckById(id)
            .then(result => {
                if (result.length !== 0) {
                    return modelBooks.deleteGenre(id)
                        .then(result => res.json({
                            status: 200,
                            id,
                            message: 'Genre has been deleted'
                        }))
                        .catch(err => console.log(err))
                } else {
                    return res.status(400).send({
                        status: 400,
                        id,
                        message: 'Genre does not exist'
                    })
                }
            })
    },
    getHistory: (req, res) => {
        modelBooks.getHistory()
            .then(result => {
                if (result.length !== 0) {

                    res.send({
                        status: 200,
                        message: 'User History Successfully Received!',
                        result
                    })
                } else {
                    res.send({
                        status: 400,
                        message: 'User History is not exist'
                    })
                }
            })
            .catch(err => {
                console.log(err)
            })
    }
}