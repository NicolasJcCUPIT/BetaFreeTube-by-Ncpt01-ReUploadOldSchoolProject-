import crypt from 'cryptr'
import 'dotenv/config.js'
const SECRET_CRYPT = process.env.SECRET_CRYPT
const _encrypt = new crypt(SECRET_CRYPT)

// Fonction permettant de crypter un texte
export async function encrypt_txt(text){
    try{
        const data = _encrypt.encrypt(text)
        console.log(data)
        return data
    }catch(err){
        console.log(`Erreur survenue lors du cryptage de votre texte: ${err}.`)
        return err
    }
}

// Fonction permettant de décrypter un texte
export async function decrypt_txt(text){
    try{
        const data = _encrypt.decrypt(text)
        console.log(data)
        return data
    }catch(err){
        console.log(`Erreur survenue lors du décryptage de votre texte: ${err}.`)
        return err
    }
}
/** Fonctions de test:
 * await encrypt_txt("test")
 * await decrypt_txt("067e92e223af30c0414e3b4206db66d3f61dfe19d88d50c4411264a9b8dc8d12449721688522e88402060b93190029a3e8b6f4fe6f0d59f77c0657f68c93fe2d7cc9030e455a10169c6991a4398e8d74e74a6490704515c836e5db04735e0ecd1effc120")
**/

