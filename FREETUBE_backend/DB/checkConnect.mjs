import { getConn } from "./db.mjs";
// Fonction pour vérifier la connexion à la base de données
export default async function dbConnectionCheck() {
    try {
        const conn = await getConn()
        await conn.query('SELECT 1')
        return true
    } catch (err) {
        console.log(`Erreur de connexion à la base de données: ${err}`);
        return false
    }
}
