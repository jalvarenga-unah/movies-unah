import express from 'express'
import cors from 'cors' // disponible gracias a la instalación
import authRoutes from './routes/auth.routes.js' // rutas de autenticación
import moviesRoutes from './routes/movies.routes.js'
import dotenv from 'dotenv' // para cargar las variables de entorno desde el archivo .env
import helmet from "helmet";
import { rateLimit } from 'express-rate-limit'
import { success } from 'zod/v4'

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 50,
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    }
})


const app = express() // para crear la aplicación de express

dotenv.config()// cargar las varianles del entorno desde el archivo .env
app.use(helmet()); // para mejorar la seguridad de la aplicación
app.use(limiter)
const PORT = process.env.PORT || 3000 // puerto donde se ejecutará la aplicación

// middlewares
app.use(express.json()) // se encarga de parsear el body de las peticiones
app.use(cors({
    // configuración de los origenes permitidos
    origin: [
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'https://prod.server.com',
        'https://test.server.com'
    ],
    // metodos permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // encabezados permitidos
    allowedHeaders: ['Content-Type', 'Authorization', 'Bearer', 'api-key']
}))

// app.use((req, res, next) => {

//     let body = '';

//     req.on('data', (chunk) => {
//         body += chunk.toString(); // convierte el buffer a string
//     });

//     req.on('end', () => {
//         req.body = JSON.parse(body); // convierte el string a JSON
//         next()
//     })

//     console.log('Middleware ejecutado');
// })

// rutas de peliculas
app.use('/movies', moviesRoutes)

//rutas de autenticación
app.use('/auth', authRoutes)

// ruta por defecto, cuando no hace match 
app.use((req, res) => {
    res.status(404).json(
        {
            message: `${req.url} no encontrada`
        }
    )
})


app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
})    