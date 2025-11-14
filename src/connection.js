// Conectando a la base de datos
import mariadb from "mariadb"
import dotenv from "dotenv"
dotenv.config()
async function connect() {
    try {
        const pool = mariadb.createPool({
            host: process.env.db_host,
            port: process.env.db_port,
            user: process.env.db_user,     
            password: process.env.db_password,
            database: process.env.db_name,  
            ssl:true,
            connectionLimit: 5
        });

        // Obtenemos una conexión libre del pool
        const connection = await pool.getConnection();
        return connection;
    } catch (err) {
        console.error("Error al obtener conexión del pool:", err);
        throw err; // Lanza el error para que el código que llama lo maneje
    }
}
export default {connect};