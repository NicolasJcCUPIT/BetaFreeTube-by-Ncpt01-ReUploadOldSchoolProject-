import jwt from 'jsonwebtoken'
import { encrypt_txt } from './crypt_txt.mjs'
import 'dotenv/config.js'

const SECRET_JWT = process.env.SECRET_JWT
// Fonction de création de token
export async function token_creation(u_id, _ip, _age){
    const _id = await encrypt_txt(u_id); const _ip_ = await encrypt_txt(_ip);
    const token = jwt.sign({"n": _id, "nn": _ip_, "nnn": _age},SECRET_JWT,{algorithm: 'HS256', expiresIn: "10h"})
    try{
        console.log(token)
        return token
    }catch(err){
        console.log(`Erreur survenue lors de la création du token: ${err}.`)
        return err
    }
}

// Fonction permettant de vérifer la durée de validité du token, renvoie son contenu si il est valide
export async function token_verif(u_token){
    try{
        const token_verif = jwt.verify(u_token, SECRET_JWT)
        if(token_verif){return token_verif}else{ return false}
    }catch(err){
    console.log(`Erreur survenue lors de la vérificaiton du token: ${err}.`)
    return false
    }
}


