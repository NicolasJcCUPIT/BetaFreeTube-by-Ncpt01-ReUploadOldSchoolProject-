import { decrypt_txt, encrypt_txt } from '../DB/crypt_txt.mjs'
import { hash_text, check_hash, hash_text_salt } from '../DB/hash_txt.mjs'
import { getConn } from '../DB/db.mjs'
import { token_creation, token_verif } from '../DB/jwt.mjs'
import { _assetDefautMiniature, _assetDefautPhoto, _miniDirectory, _photosDirectory } from '../DB/path_assets.mjs'
import fs from 'fs/promises'

// Variable utilisé pour le renommage des profil pic(afin qu'elles soient uniques)
const ss = new Date().getSeconds()

//** Fonctions liées aux routes de gestion des utilisateurs authentifiés   ------------------------------------------------------------- */

// Vérifie si un utilisateur existe déjà dans la base de données
export async function u_exist(email, ftb_nom) {
    const conn = await getConn()
    try{
        const _email = await hash_text_salt(email)
        console.log(_email)
        const data = await conn.query("SELECT * FROM utilisateurs WHERE u_email =? OR u_ftb_nom =?", [_email, ftb_nom])
        console.log(data)
        if(data.length > 0){return false}else{return null}
    }catch(err){
        console.log(`Impossible de vérifier si le profil existe dans la base de données: ${err}.`)
        return err
    }finally{
        conn.release()
    }
}

// Création du compte utilisateur
export async function u_creation(ftb_nom, nom, prenom, email, passwd, age) {
    const conn = await getConn()
    try{
        const _nom = await encrypt_txt(nom)
        const _prenom = await encrypt_txt(prenom)
        const _email = await hash_text_salt(email)
        const _passwd = await hash_text(passwd)
        const _age = await encrypt_txt(age)
        const data = await conn.query(
            "INSERT INTO utilisateurs (u_ftb_nom, u_nom, u_prenom, u_email, u_passwd, u_age, u_pp) VALUES(?,?,?,?,?,?,?)",
            [ftb_nom, _nom, _prenom, _email, _passwd, _age, _assetDefautPhoto])
        console.log(data)
        if(data){
            return true}else{return false}
    }catch(err){
        console.log(`Impossible d'insérer l'utilisateur ${ftb_nom}.`)
        return err
    }finally{
        conn.release()
    }
}

// Connexion d'un utilisateur
export async function u_login(email, passwd, _ip){
    const conn = await getConn()
    try{
        const _email = await hash_text_salt(email)
        console.log(`email:${_email}, pass: ${passwd}`)
        const data = await conn.query("SELECT * FROM utilisateurs WHERE u_email =?", [_email])
        const passwd_verif = await check_hash(passwd, data[0].u_passwd)
        console.log(data, passwd_verif)
        if(data.length > 0 && passwd_verif == true){
            try{
                return { token: await token_creation(data[0].u_id, _ip, data[0].u_age), email: email, passwd: passwd}
            }catch(err){
                console.log(`Impossible de se connecter: ${err}.`)
                return false
            }
        }else{return false}
    }catch(err){
        console.log(`Impossible de se connecter: ${err}.`)
        return false
    }finally{
        conn.release()
    }}

// Modifier son email
export async function u_modifMail(token, nouvelEmail, _ip){
    const conn = await getConn()
    try{
        const decode = await token_verif(token)
        console.log("decode:",decode)
        if(decode == false){
            console.log(`Token expiré`)
            return "exp"
        }else{
            const token_ip = await decrypt_txt(decode.nn)
            const token_id = await decrypt_txt(decode.n)
            if(token_ip == _ip){
                try{
                    await conn.query("UPDATE utilisateurs SET u_email =? WHERE u_id =?", [await hash_text_salt(nouvelEmail), token_id])
                    return true
                }catch(err){
                    console.log(`Erreur survenue lors du changement de l'adresse email: ${err}.`)
                    return false
                }
            }else if(token_ip != _ip){return "ip"}
        }
    }catch(err){
        console.log(`Erreur survenue lors de la modification de l'adresse email: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// Modifier le mot de passe
export async function u_modifPasswd(token, nouvPasswd, _ip){
    const conn = await getConn()
    try{
        const decode = await token_verif(token)
        console.log("decode:",decode)
        if(decode == false){
            console.log(`Token expiré`)
            return "exp"
        }else{
            const token_ip = await decrypt_txt(decode.nn)
            const token_id = await decrypt_txt(decode.n)
            if(token_ip == _ip){
                try{
                    await conn.query("UPDATE utilisateurs SET u_passwd =? WHERE u_id =?", [await hash_text(nouvPasswd), token_id])
                    return true
                }catch(err){
                    console.log(`Erreur survenue lors de la modification du mot de passe: ${err}.`)
                    return false
                }
            }else if(token_ip != _ip){return "ip"}
        }
    }catch(err){
        console.log(`Erreur survenue lors de la modification du mot de passe: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// Modifier la description de la chaîne freetube
export async function u_modifDescript(token, nouvelDescription, _ip){
    const conn = await getConn()
    try{
        const decode = await token_verif(token)
        console.log("decode:",decode)
        if(decode == false){
            console.log(`Token expiré`)
            return "exp"
        }else{
            const token_ip = await decrypt_txt(decode.nn)
            const token_id = await decrypt_txt(decode.n)
            if(token_ip == _ip){
                try{
                    await conn.query("UPDATE utilisateurs SET u_description =? WHERE u_id =?", [nouvelDescription, token_id])
                    return true
                }catch(err){
                    console.log(`Erreur survenue lors de la mise à jour de la description de chaîne: ${err}.`)
                    return false
                }
            }else if(token_ip != _ip){return "ip"}
        }
    }catch(err){
        console.log(`Erreur survenue lors de la mise à jour de la description de chaîne: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// Modifier le nom d'affichage de la chaîne
export async function u_modifNom(token, nouvNom, _ip){
    const conn = await getConn()
    try{
        const decode = await token_verif(token)
        console.log("decode:",decode)
        if(decode == false){
            console.log(`Token expiré`)
            return "exp"
        }else{
            const token_ip = await decrypt_txt(decode.nn)
            const token_id = await decrypt_txt(decode.n)
            if(token_ip == _ip){
                try{
                    const nom_exist = await conn.query("SELECT * FROM utilisateurs WHERE u_ftb_nom =?", [nouvNom])
                    if(nom_exist.length > 0){
                        return "existe"
                    }else{
                        await conn.query("UPDATE utilisateurs SET u_ftb_nom =? WHERE u_id =?", [nouvNom, token_id])
                        return true
                    }
                }catch(err){
                    console.log(`Erreur survenue lors de la mise à jour de la description de chaîne: ${err}.`)
                    return false
                }
            }else if(token_ip != _ip){return "ip"}
        }
    }catch(err){
        console.log(`Erreur survenue lors de la mise à jour de la description de chaîne: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// Modifier sa photo de profil
export async function u_modifPp(token, image, _ip, extension){
    const conn = await getConn()
    try{
        const decode = await token_verif(token)
        console.log("decode:",decode, "\n", "image:",image)
        if(decode == false){
            console.log(`Token expiré`)
            return "exp"
        }else{
            const token_ip = await decrypt_txt(decode.nn)
            const token_id = await decrypt_txt(decode.n)
            if(token_ip == _ip){
                try{
                    const exist_photo = await conn.query("SELECT u_pp FROM utilisateurs WHERE u_id =?", [token_id,])
                    exist_photo[0].u_pp != _assetDefautPhoto?await fs.rm(exist_photo[0].u_pp, {force:true}):null
                    const nouvNom = `${_photosDirectory}/Profil${await decrypt_txt(decode.n)}${extension}`
                    await fs.rename(image.path, nouvNom)
                    await conn.query("UPDATE utilisateurs SET u_pp=? WHERE u_id =?", [nouvNom, token_id])
                    return nouvNom
                }catch(err){
                    console.log(`Erreur survenue lors de la mise à jour de la photo de profil: ${err}.`)
                    return false
                }
            }else if(token_ip != _ip){return "ip"}
        }
    }catch(err){
        console.log(`Erreur survenue lors de la mise à jour de la photo de profil: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// Obtenir les statistiques et autres informations de sa chaîne FreeTube
export async function u_stats(token, _ip){
    const conn = await getConn()
    try{
        const decode = await token_verif(token)
        if(decode == false){
            console.log(`Token expiré`)
            return "exp"
        }else{
            const token_ip = await decrypt_txt(decode.nn)
            const token_id = await decrypt_txt(decode.n)
            if(token_ip == _ip){
                try{const exist_user = await conn.query("SELECT u_ftb_nom, u_description, u_pp, u_t_commentaires, u_t_jaimes, u_t_abos, u_t_vues FROM utilisateurs WHERE u_id =?", [token_id,])
                    if(exist_user.length > 0){
                        return exist_user }else{return false}
                }catch(err){
                    console.log(`Erreur survenue lors de la récupération des informations de votre chaîne: ${err}.`)
                    return false
                }
            }else if(token_ip != _ip){return "ip"}
        }
    }catch(err){
        console.log(`Erreur survenue lors de la mise à jour de la photo de profil: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// Supprimer son compte utilisateur
export async function u_supp(token, _ip){
    const conn = await getConn()
    try{
        const decode = await token_verif(token)
        console.log("decode:",decode)
        if(decode == false){
            console.log(`Token expiré`)
            return "exp"
        }else{
            const token_ip = await decrypt_txt(decode.nn)
            const token_id = await decrypt_txt(decode.n)
            if(token_ip == _ip){
                try{const exist_photo = await conn.query("SELECT u_pp FROM utilisateurs WHERE u_id =?", [token_id,])
                    exist_photo[0].u_pp != _assetDefautPhoto?await fs.rm(exist_photo[0].u_pp, {force:true}):null
                    const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id=?", [token_id])
                    const exist_videos = await conn.query("SELECT v_miniature, v_video FROM videos WHERE v_auth_fk =?", [ftb_nom])
                    exist_videos.forEach(async e=>{
                        e.v_miniature != _assetDefautMiniature?await fs.rm(e.v_miniature):null
                        await fs.rm(e.v_video)
                    })
                    await conn.query("DELETE FROM utilisateurs WHERE u_id =?", [token_id])
                    return true
                }catch(err){
                    console.log(`Erreur survenue lors suppression du compte: ${err}.`)
                    return false}
            }else if(token_ip != _ip){return "ip"}
        }
    }catch(err){
        console.log(`Erreur survenue lors de la suppression du compte: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// Vérifie si un utilisateur est déjà abonné à une chaîne freetube
export async function u_check_abo(token, _ip, nom_createur){
    const conn = await getConn()
    try{
        const decode = await token_verif(token)
        if(decode == false){
            console.log(`Token expiré`)
            return "exp"
        }else{
            const token_ip = await decrypt_txt(decode.nn)
            const token_id = await decrypt_txt(decode.n)
            if(token_ip == _ip){
                try{
                    const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id=?", [token_id])
                    console.log(ftb_nom)
                    const abonnement_exist = await conn.query("SELECT a_abonnement_fk FROM abonnements WHERE a_abo_fk =? AND a_abonnement_fk =?", [ftb_nom[0].u_ftb_nom, nom_createur])
                    console.log(abonnement_exist.length, abonnement_exist)
                    if(ftb_nom.length > 0 && abonnement_exist.length > 0){
                        return true
                    }else{return false}
                }catch(err){
                    console.log(`Erreur survenue lors de la vérification de votre abonnement à la chaîne ${nom_createur}: ${err}.`)
                    return false
                }
            }else if(token_ip != _ip){return "ip"}
        }
    }catch(err){
        console.log(`Erreur survenue lors de la vérification de votre abonnement à la chaîne ${nom_createur}: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// S'abonner à un utilisateur
export async function u_suivre(token, _ip, nom_createur){
    const conn = await getConn()
    try{
        const decode = await token_verif(token)
        if(decode == false){
            console.log(`Token expiré`)
            return "exp"
        }else{
            const token_ip = await decrypt_txt(decode.nn)
            const token_id = await decrypt_txt(decode.n)
            if(token_ip == _ip){
                try{
                    const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id=?", [token_id])
                    console.log(ftb_nom)
                    const abonnement_exist = await conn.query("SELECT a_abonnement_fk FROM abonnements WHERE a_abo_fk =? AND a_abonnement_fk =?", [ftb_nom[0].u_ftb_nom, nom_createur])
                    console.log(abonnement_exist.length, abonnement_exist)
                    if(ftb_nom.length > 0 && abonnement_exist.length <= 0){
                        if(ftb_nom[0].u_ftb_nom != nom_createur){
                            await conn.query("INSERT INTO abonnements(a_abo_fk, a_abonnement_fk) VALUES(?,?)", [ftb_nom[0].u_ftb_nom, nom_createur])
                            await conn.query("UPDATE utilisateurs SET u_t_abos= u_t_abos +1 WHERE u_ftb_nom =?", [nom_createur])
                            return true
                        }else{return false}
                    }else{return false}
                }catch(err){
                    console.log(`Erreur survenue lors de votre tentative d'abonnement au compte ${nom_createur}: ${err}.`)
                    return false
                }
            }else if(token_ip != _ip){return "ip"}
        }
    }catch(err){
        console.log(`Erreur survenue lors de la tentative d'abonnement à la chaîne: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// Se désabonner à un utilisateur
export async function u_plus_suivre(token, _ip, nom_createur){
    const conn = await getConn()
    try{
        const decode = await token_verif(token)
        if(decode == false){
            console.log(`Token expiré`)
            return "exp"
        }else{
            const token_ip = await decrypt_txt(decode.nn)
            const token_id = await decrypt_txt(decode.n)
            if(token_ip == _ip){
                try{
                    const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id=?", [token_id])
                    console.log(ftb_nom)
                    const abonnement_exist = await conn.query("SELECT a_abonnement_fk FROM abonnements WHERE a_abo_fk =? AND a_abonnement_fk =?", [ftb_nom[0].u_ftb_nom, nom_createur])
                    console.log(abonnement_exist.length, abonnement_exist)
                    if(ftb_nom.length > 0 && abonnement_exist.length > 0){
                        await conn.query("DELETE FROM abonnements WHERE a_abo_fk =? AND a_abonnement_fk =?", [ftb_nom[0].u_ftb_nom, nom_createur])
                        await conn.query("UPDATE utilisateurs SET u_t_abos= u_t_abos -1 WHERE u_ftb_nom =?", [nom_createur])
                        return true
                    }else{return false}
                }catch(err){
                    console.log(`Erreur survenue lors de votre tentative d'abonnement au compte ${nom_createur}: ${err}.`)
                    return false
                }
            }else if(token_ip != _ip){return "ip"}
        }
    }catch(err){
        console.log(`Erreur survenue lors de la tentative d'abonnement à la chaîne: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// File d'actualité des personnes auxquels l'utilisateur est abonné
export async function u_actualité(token, _ip){
    const conn = await getConn()
    try{
        const decode = await token_verif(token)
        if(decode == false){
            console.log(`Token expiré`)
            return "exp"
        }else{
            const token_ip = await decrypt_txt(decode.nn)
            const token_id = await decrypt_txt(decode.n)
            if(token_ip == _ip){
                try{
                    const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id=?", [token_id])
                    console.log(ftb_nom)
                    let actualites = []
                    const abonnements = await conn.query("SELECT a_abonnement_fk FROM abonnements WHERE a_abo_fk =?", [ftb_nom[0].u_ftb_nom])
                    console.log(abonnements)
                    for(const e of abonnements){
                        let data_ = await conn.query(
                            `SELECT v_id, v_titre, v_auth_fk, v_miniature, v_video, v_description, v_tag1, v_tag2, v_tag3, v_tag4, v_tag5, v_tag6, v_tag7, v_tag8, v_tag9, v_tag10, 
                            v_categorie_fk, v_t_jaimes, v_t_commentaires, v_t_vues, v_DATE 
                            FROM videos WHERE v_statut=1 AND v_auth_fk=? AND DATE(v_DATE) <= CURDATE() ORDER BY v_DATE`,
                            [e.a_abonnement_fk])
                        console.log("data:",data_)
                        data_.forEach(data=>{
                            actualites.push(data)
                        })
                    }
                    console.log("actu:",actualites)
                    if(actualites.length > 0){
                        return actualites
                    }else{
                        return null
                    }
                }catch(err){
                    console.log(`Erreur survenue lors de la récupération du fil d'actualités: ${err}.`)
                    return false
                }
            }else if(token_ip != _ip){return "ip"}
        }
    }catch(err){
        console.log(`Erreur survenue lors de la tentative d'abonnement à la chaîne: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}
//**                    -----------------------------------------------------------------------------------------------                 */
