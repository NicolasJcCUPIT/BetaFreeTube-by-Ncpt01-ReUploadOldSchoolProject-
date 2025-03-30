import mariadb from 'mariadb'
import 'dotenv/config.js'

// Fonction de création de pool de connection à la base de données mariadb
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWD,
    database: process.env.DB_NOM,
    port: process.env.DB_PORT,
    connectionLimit: 60,
    connectTimeout: 30000}
)

// Fonction pour obtenir une connexion dans la pool
export async function getConn(){
    try{
        const conn = await pool.getConnection()
        return conn
    }catch(err){
        console.log(`Erreur lors de la récupération de la connexion: ${err}`); throw err}
}
