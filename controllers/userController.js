require('dotenv').config()
const modelAuth = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const {
    registerValidation,
    loginValidation
} = require('../middleware/authMiddleware')

module.exports = {
    registerUser: (req, res) => {
        const {
            error
        } = registerValidation(req.body)
        if (error) {
            return res.send({
                status: 400,
                message: error.details[0].message
            })
        }
        const salt = bcrypt.genSaltSync(10)
        const hashedPassword = bcrypt.hashSync(req.body.password, salt)
        const data = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        }
        modelAuth.registerCheck(data)
            .then(result => {
                if (result.length === 0) {
                    return modelAuth.registerUser(data)
                        .then(result => res.json({
                            status: 200,
                            message: 'Usuario creado exitosamente.',
                            user: {
                                username: req.body.username,
                                email: req.body.email,
                                password: hashedPassword
                            }
                        }))
                        .catch(err => console.log(err))
                } else {
                    return res.status(400).send({
                        status: 400,
                        message: 'Usuario ya registrado.'
                    })
                }
            })
    },
    loginUser: (req, res) => {
        const {
            error
        } = loginValidation(req.body)
        if (error) {
            return res.status(400).send({
                status: 400,
                message: error.details[0].message
            })
        }
        const data = {
            username: req.body.username,
            password: req.body.password
        }
        modelAuth.loginUser(data)
            .then(result => {
                const validPassword = bcrypt.compareSync(req.body.password, result[0].password)
                if (!validPassword) {
                    return res.send({
                        status: 400,
                        message: 'Contraseña incorrecta.'
                    })
                }
                const token = jwt.sign({
                    id: result[0].id,
                    username: result[0].username
                }, process.env.TOKEN_SECRET, {
                    expiresIn: '10h'
                })
                res.send({
                    status: 200,
                    message: 'Ingreso exitoso.',
                    username: result.username,
                    password: result.password,
                    token
                })
            })
            .catch(err => res.send({
                status: 400,
                message: 'Usuario no existe.'
            }))
    }
}