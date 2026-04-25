// Importación de librerías necesarias
const express = require('express'); // Framework para crear el servidor
const sql = require('mssql'); // Librería para conectar con SQL Server
const cors = require('cors'); // Permite conexiones desde el frontend

const app = express();

// Middleware
app.use(cors()); // Habilita CORS
app.use(express.json()); // Permite recibir JSON en las peticiones


// Función para construir la configuración de conexión a la base de datos
function getConfig(user, password, database) {
    return {
        user: user, // Usuario SQL
        password: password, // Contraseña SQL
        server: 'localhost', // Servidor
        port: 1433, // Puerto configurado
        database: database, // Base de datos
        options: {
            encrypt: false, // No usar cifrado
            trustServerCertificate: true // Aceptar certificado
        }
    };
}


// Endpoint para login
app.post('/login', async (req, res) => {

    // Se obtienen los datos enviados desde el frontend
    const { server, database, user, password } = req.body;

    // Validación del nombre del servidor según el enunciado
    if (server !== "localhost") {
        return res.json({
            success: false,
            message: "Servidor incorrecto"
        });
    }

    // Validación del nombre de la base de datos
    if (database !== "FutData") {
        return res.json({
            success: false,
            message: "Base de Datos Incorrecta"
        });
    }

    // Se crea la configuración de conexión
    const config = getConfig(user, password, database);

    let pool; // Variable para manejar la conexión

    try {
        // Intento de conexión a SQL Server
        pool = await sql.connect(config);

        // Consulta para verificar que realmente estamos en la base correcta
        const result = await pool.request().query('SELECT DB_NAME() AS db');

        // Si la base no coincide, se lanza error
        if (result.recordset[0].db !== database) {
            throw new Error("Base de datos incorrecta");
        }

        // Si todo está bien, se responde éxito
        res.json({
            success: true,
            message: "Login correcto"
        });

    } catch (error) {

        // Se imprime el error en consola
        console.log("ERROR LOGIN:", error.message);

        // Se envía el error al frontend
        res.json({
            success: false,
            message: error.message
        });

    } finally {
        // Se cierra la conexión si existe
        if (pool) await pool.close();
    }
});


// Endpoint para ejecutar consultas SQL (segunda interfaz)
app.post('/query', async (req, res) => {

    // Datos enviados desde el frontend
    const { user, password, database, query } = req.body;

    // Configuración de conexión
    const config = getConfig(user, password, database);

    let pool;

    try {
        // Conexión a la base de datos
        pool = await sql.connect(config);

        // Ejecución de la consulta enviada por el usuario
        const result = await pool.request().query(query);

        // Se envían los datos obtenidos (si es SELECT)
        res.json({
            success: true,
            data: result.recordset || []
        });

    } catch (error) {

        // Se imprime el error en consola
        console.log("ERROR SQL:", error.message);

        const msg = error.message.toLowerCase();

        // Clasificación de errores

        // Error de permisos
        if (msg.includes("permission")) {
            return res.json({
                success: false,
                type: "permission",
                message: "Permiso denegado"
            });
        }

        // Error de sintaxis
        if (msg.includes("syntax") || msg.includes("incorrect syntax")) {
            return res.json({
                success: false,
                type: "syntax",
                message: "Error de sintaxis SQL"
            });
        }

        // Error de tabla o columna inexistente
        if (msg.includes("invalid object")) {
            return res.json({
                success: false,
                type: "object",
                message: "Tabla o columna no existe"
            });
        }

        // Otro tipo de error
        return res.json({
            success: false,
            type: "other",
            message: error.message
        });

    } finally {
        // Cierre de conexión
        if (pool) await pool.close();
    }
});


// Inicialización del servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});