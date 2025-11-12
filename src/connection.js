// Conectando a la base de datos
import mariadb from "mariadb"
import dotenv from "dotenv"
dotenv.config()
async function connect() {
    try {
        const pool = mariadb.createPool({
            host: proccess.env.db_host,
            user: proccess.env.db_user,     
            password: proccess.env.db_password,  
            database: proccess.env.db_name, 
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
export {connect};