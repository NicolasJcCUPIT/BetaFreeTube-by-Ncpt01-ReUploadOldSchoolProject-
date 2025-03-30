import * as argon2 from 'argon2'
import * as crypto from 'node:crypto'
import 'dotenv/config.js'

// Fonction pour hacher du texte
export async function hash_text(text){
    try{
        const data =  await argon2.hash(text,{type: argon2.argon2i, hashLength: 28, timeCost: 20})
        console.log(data)
        return data
    }catch(err){
        console.log(`Erreur survenue lors du hachage de votre texte: ${err}.`)
        return err
    }
}

// Fonction servant vérifier l'authenticité d'un texte en le comparant à sa vaeleur hachée.
 export async function check_hash(text, hash_){
    try{
        const data = await argon2.verify(hash_, text)
        console.log(data)
        if(data == true){return true}else{return false}
    }catch(err){
        console.log(`Erreur survenue lors de la vérification de votre texte: ${err}.`)
        return err
    }
 }

 /** Fonctions de test:
  * await hash_text("test")
  * await check_hash("test", "$argon2i$v=19$m=65536,t=20,p=4$fe7zWmFLSzKN9zhRuRUhvw$bcTqkKzzN8OzXmG2neC7IpaC3yT5ezSVmhexlA")
**/

/**  Fonction de hash avec un salt identique(pour les emails) 
 * Permet d'exécuter un select sur la base de données afin de vérifier si un utilisateur existe déjà.
 * Evite de récupérer l'ensemble des emails de la db pour les comparer à l'input de l'utilisateur...
*/
export async function hash_text_salt(text){
    try{
        const PER_SALT  = Buffer.from(process.env.PER_SALT, 'utf-8')
        const data =  await argon2.hash(text,{type: argon2.argon2i, hashLength: 28, timeCost: 20, salt: PER_SALT})
        console.log(data)
        return data
    }catch(err){
        console.log(`Erreur survenue lors du hachage de votre texte: ${err}.`)
        return err
    }
}