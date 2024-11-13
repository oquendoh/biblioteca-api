const express = require('express')
const Route = express.Router()
const AuthController = require('../controllers/userController')

Route
    .get('/', (req, res) => {
        res.json({
            message: "Bienvenido de nuevo.",
            login: "Si ya tienes una cuenta, ingresa.",
            register: "Registra una nueva cuenta."
        })
    })
    .post('/register', AuthController.registerUser)
    .post('/login', AuthController.loginUser)

module.exports = Route