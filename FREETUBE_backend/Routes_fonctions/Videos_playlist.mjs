import { getConn } from "../DB/db.mjs"
import { _miniDirectory, _videoDirectory } from "../DB/path_assets.mjs"
import { token_verif } from "../DB/jwt.mjs"
import { decrypt_txt } from "../DB/crypt_txt.mjs"
import fs from 'fs/promises'
//** Gestion des playlists et vidéos pour les utilisateurs authentifiés   -----------------------------   */

// Fonction de création de vidéo
export async function v_creation(u_token, miniature, video, titre, description, tag1, tag2, tag3, tag4, tag5, 
    tag6, tag7, tag8, tag9, tag10, categorie, _date, _ip, extension_miniature, extension_vide, visibilite, plus18_){
    const conn = await getConn()
    const decode = await token_verif(u_token)
    const convert_visibilite = {"non":0, "oui":1} 
    const convert_plus18 = {"non":1, "oui":0}
    console.log("decode:",decode)
    if(decode == false){
        console.log(`Token expiré`)
        return "exp"
    }else{
        const token_ip = await decrypt_txt(decode.nn)
        const token_id = await decrypt_txt(decode.n)
        if(token_ip == _ip){
            try{
                // Variables utilisées pour le renommage des médias de vidéos (afin qu'ils soient uniques)
                const ss = new Date().getSeconds()
                const milli_sec = new Date().getMilliseconds()
                const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id =?",[token_id])
                const video_nom = `${_videoDirectory}/${await decrypt_txt(decode.n)}_${ss}${milli_sec}${extension_vide}`
                await fs.rename(video.path, video_nom)
                const miniature_nom = `${_miniDirectory}/${await decrypt_txt(decode.n)}_${ss}${milli_sec}${extension_miniature}`
                await fs.rename(miniature.path, miniature_nom)
                console.log(visibilite, plus18_, "\n")
                console.log(tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10,)
                if(visibilite == "non" &&  plus18_  =="non"){await conn.query(
                    `INSERT INTO videos(v_auth_fk, v_miniature, v_video, v_titre, v_description, v_tag1, v_tag2, v_tag3, v_tag4, v_tag5, v_tag6, v_tag7, v_tag8, v_tag9, v_tag10, v_categorie_fk, 
                    v_DATE, v_statut, v_majeur) 
                    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [ftb_nom[0].u_ftb_nom, miniature_nom, video_nom, titre.toLowerCase(), description, tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10, categorie, _date, 
                    convert_visibilite.non, convert_plus18.non]
                )}else if(visibilite == "oui" &&  plus18_  =="oui"){await conn.query(
                    `INSERT INTO videos(v_auth_fk, v_miniature, v_video, v_titre, v_description, v_tag1, v_tag2, v_tag3, v_tag4, v_tag5, v_tag6, v_tag7, v_tag8, v_tag9, v_tag10, v_categorie_fk, 
                    v_DATE, v_statut, v_majeur) 
                    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [ftb_nom[0].u_ftb_nom, miniature_nom, video_nom, titre.toLowerCase(), description, tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10, categorie, _date, 
                    convert_visibilite.oui, convert_plus18.oui]
                )}else if(visibilite == "non" &&  plus18_  =="oui"){await conn.query(
                    `INSERT INTO videos(v_auth_fk, v_miniature, v_video, v_titre, v_description, v_tag1, v_tag2, v_tag3, v_tag4, v_tag5, v_tag6, v_tag7, v_tag8, v_tag9, v_tag10, v_categorie_fk, 
                    v_DATE, v_statut, v_majeur) 
                    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [ftb_nom[0].u_ftb_nom, miniature_nom, video_nom, titre.toLowerCase(), description, tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10, categorie, _date, 
                    convert_visibilite.non, convert_plus18.oui]
                )}else if(visibilite == "oui" &&  plus18_  =="non"){await conn.query(
                    `INSERT INTO videos(v_auth_fk, v_miniature, v_video, v_titre, v_description, v_tag1, v_tag2, v_tag3, v_tag4, v_tag5, v_tag6, v_tag7, v_tag8, v_tag9, v_tag10, v_categorie_fk, 
                    v_DATE, v_statut, v_majeur) 
                    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [ftb_nom[0].u_ftb_nom, miniature_nom, video_nom, titre.toLowerCase(), description, tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10, categorie, _date, 
                    convert_visibilite.oui, convert_plus18.non]
                )}return true
            }catch(err){
                console.log(`Erreur survenue lors de l'ajout de la vidéo: ${err}.`)
                return false
            }finally{conn.release()}
        }else if(token_ip != _ip){return "ip"}
    }
}

// Obtenir la liste de ses vidéos FreeTube
export async function v_list_videos(u_token, _ip){
    const conn = await getConn()
    const decode = await token_verif(u_token)
    console.log("decode:",decode)
    if(decode == false){
        console.log(`Token expiré`)
        return "exp"
    }else{
        const token_ip = await decrypt_txt(decode.nn)
        const token_id = await decrypt_txt(decode.n)
        if(token_ip == _ip){
            try{const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id =?",[token_id])
                const MesVideos = await conn.query("SELECT * FROM videos WHERE v_auth_fk =?", [ftb_nom[0].u_ftb_nom])
                return MesVideos
            }catch(err){
                console.log(`Erreur survenue lors de la récupération de la liste des vidéos de la chaîne: ${err}.`)
                return false
            }finally{conn.release()}
        }else if(token_ip != _ip){return "ip"}
    }
}

// Obtenir la liste des vidéo d'une chaîne freetube
export async function v_list_videos_2(chaine_nom){
    const conn = await getConn()
    console.log(chaine_nom)
    const channel_videos_ = await conn.query(`
        SELECT v_id, v_titre, v_auth_fk, v_miniature, v_video, v_description, v_tag1, v_tag2, v_tag3, v_tag4, v_tag5, 
        v_tag6, v_tag7, v_tag8, v_tag9, v_tag10, v_categorie_fk, v_t_jaimes, v_t_commentaires, v_t_vues, v_DATE
        FROM videos WHERE v_statut =1 AND DATE(v_DATE) <= CURDATE() AND v_auth_fk =?`, [chaine_nom])
    console.log(channel_videos_)
        if(channel_videos_.length >0){
            try{
                return channel_videos_
            }catch(err){
                console.log(`Erreur survenue lors de la récupération des vidéos de la chaîne ${chaine_nom}: ${err}.`)
                return false
            }finally{conn.release()}
        }else{return false}
}

// Fonction permettant d'éditer une vidéo 
// Mettre à jour le titre, le statut, la visibilité ou la date de la vidéo
export async function v_change_video(u_token, _ip, ID_video, titre, description_, date_, visibilite, plus18_, tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10){
    const conn = await getConn()
    var tag_list = [{"nom": "tag1", "content": tag1}, {"nom": "tag2", "content": tag2},  {"nom": "tag3", "content": tag3},  {"nom": "tag4", "content": tag4},
        {"nom": "tag5", "content": tag5}, {"nom": "tag6", "content": tag6}, {"nom": "tag7", "content": tag7}, {"nom": "tag8", "content": tag8}, {"nom": "tag9", "content": tag9},
        {"nom": "tag10", "content": tag10}]
    const decode = await token_verif(u_token)
    const convert_visibilite = {"non":0, "oui":1} 
    const convert_plus18 = {"non":1, "oui":0}
    console.log("decode:",decode)
    if(decode == false){
        console.log(`Token expiré`)
        return "exp"
    }else{
        const token_ip = await decrypt_txt(decode.nn)
        const token_id = await decrypt_txt(decode.n)
        if(token_ip == _ip){
            try{
                const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id =?",[token_id])
                const exist_video = await conn.query("SELECT v_titre FROM videos WHERE v_id =? AND v_auth_fk =?", [ID_video, ftb_nom[0].u_ftb_nom])
                if(exist_video.length > 0){
                    if(titre != null){conn.query("UPDATE videos SET v_titre =? WHERE v_id =?", [titre, ID_video])}
                    if(description_ != null){conn.query("UPDATE videos SET v_description =? WHERE v_id =?", [description_, ID_video])}
                    if(date_ != null){conn.query("UPDATE videos SET v_DATE =? WHERE v_id =?", [date_, ID_video])}
                    if(visibilite == "non"){conn.query("UPDATE videos SET v_statut =? WHERE v_id =?", [convert_visibilite.non, ID_video])}
                    if(visibilite == "oui"){conn.query("UPDATE videos SET v_statut =? WHERE v_id =?", [convert_visibilite.oui, ID_video])}
                    if(plus18_ == "non"){conn.query("UPDATE videos SET v_majeur =? WHERE v_id =?", [convert_plus18.non, ID_video])}
                    if(plus18_ == "oui"){conn.query("UPDATE videos SET v_majeur =? WHERE v_id =?", [convert_plus18.oui, ID_video])}
                    tag_list.forEach(_tag => {
                        _tag.content != ""? conn.query(`UPDATE videos SET v_${_tag.nom} =? WHERE v_id =?`, [_tag.content, ID_video]): null
                    });
                    return true
                }else{return "existe_plus"}
            }catch(err){
                console.log(`Erreur survenue lors du changement de paramètres de la vidéo: ${err}.`)
                return false
            }finally{
                conn.release()
            }
        }else if(token_ip != _ip){return "ip"}
    }
}

// Vérifie si un utilisateur a déjà liké une vidéo
export async function v_check_like(token, _ip, ID_video){
    const conn = await getConn()
    const nom_playlist = "jaime"
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
                    const likeID = await conn.query("SELECT pn_id FROM plalist_noms WHERE pn_auth_fk =? AND pn_nom =? ", [ftb_nom[0].u_ftb_nom, nom_playlist])
                    const deja_like = await conn.query(" SELECT p_v_id_fk FROM playlists WHERE p_pn_id_fk =? AND p_v_id_fk =?",[likeID[0].pn_id, ID_video])
                    console.log(ftb_nom.length, likeID.length, deja_like.length)
                    if(ftb_nom.length > 0 && deja_like.length > 0){
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

// Liker  ou dislike une vidéo
export async function v_change_jaime(u_token, _ip, ID_video){
    const conn = await getConn()
    const decode = await token_verif(u_token)
    console.log("decode:",decode)
    if(decode == false){
        console.log(`Token expiré`)
        return "exp"
    }else{
        const token_ip = await decrypt_txt(decode.nn)
        const token_id = await decrypt_txt(decode.n)
        if(token_ip == _ip){
            try{ 
                const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id =?",[token_id])
                const MaPlaylistJaime = await conn.query("SELECT pn_id FROM plalist_noms WHERE pn_nom = 'jaime' AND pn_auth_fk =?", [ftb_nom[0].u_ftb_nom])
                const video_exist = await conn.query("SELECT * FROM videos WHERE v_id =?", [ID_video])
                const deja_like = await conn.query(" SELECT p_v_id_fk FROM playlists WHERE p_pn_id_fk =? AND p_v_id_fk =?",[MaPlaylistJaime[0].pn_id, ID_video])
                console.log(MaPlaylistJaime, "déjà liké: ",deja_like.length)
                if(video_exist.length > 0 && MaPlaylistJaime.length > 0 && deja_like.length == 0){
                    await conn.query("UPDATE videos SET v_t_jaimes = v_t_jaimes +1 WHERE v_id =?", [ID_video])
                    await conn.query("INSERT INTO playlists(p_pn_id_fk, p_v_id_fk) VALUES(?,?)", [MaPlaylistJaime[0].pn_id, ID_video])
                    return true
                }else if(deja_like.length > 0){
                    await conn.query("UPDATE videos SET v_t_jaimes = v_t_jaimes -1 WHERE v_id =?", [ID_video])
                    await conn.query("DELETE FROM playlists WHERE p_pn_id_fk =? AND p_v_id_fk =?", [MaPlaylistJaime[0].pn_id, ID_video])
                    return "déjà liké"
                }else{
                    return "existe_plus"}    
            }catch(err){
                console.log(`Erreur survenue lors de l'ajout de la vidéo: ${err}.`)
                return false
            }finally{
                conn.release()
            }
        }else if(token_ip != _ip){return "ip"}
    }
}


// Supprimer une vidéo
export async function v_supprimer_video(u_token, _ip, videoID){
    const conn = await getConn()
    const decode = await token_verif(u_token)
    console.log("decode:",decode)
    if(decode == false){
        console.log(`Token expiré`)
        return "exp"
    }else{
        const token_ip = await decrypt_txt(decode.nn)
        const token_id = await decrypt_txt(decode.n)
        if(token_ip == _ip){
            try{ 
                const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id =?",[token_id])
                const del_video = await conn.query("SELECT * FROM videos WHERE v_auth_fk =? AND v_id =?", [ftb_nom[0].u_ftb_nom, videoID])
                console.log(del_video)
                if(del_video.length > 0){
                    await conn.query("DELETE FROM videos WHERE v_auth_fk =? AND v_id =?", [ftb_nom[0].u_ftb_nom, videoID])
                    await fs.rm(del_video[0].v_video); await fs.rm(del_video[0].v_miniature)
                    return true
                }else{
                    return "existe_plus"
                }    
            }catch(err){
                console.log(`Erreur survenue lors de l'ajout de la vidéo: ${err}.`)
                return false
            }finally{
                conn.release()
            }
        }else if(token_ip != _ip){return "ip"}
    }
}

// Commenter une vidéo
export async function v_commentaires(u_token, _ip, ID_video, txt){
    const conn = await getConn()
    const decode = await token_verif(u_token)
    console.log("decode:",decode)
    if(decode == false){
        console.log(`Token expiré`)
        return "exp"
    }else{
        const token_ip = await decrypt_txt(decode.nn)
        const token_id = await decrypt_txt(decode.n)
        if(token_ip == _ip){
            try{ 
                const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id =?",[token_id])
                const video_exist = await conn.query("SELECT * FROM videos WHERE v_id =?", [ID_video])
                if(video_exist.length > 0 && ftb_nom.length > 0){
                    await conn.query("INSERT INTO commentaires(c_video_id_fk, c_auth_fk, c_txt) VALUES(?,?,?)", [ID_video, ftb_nom[0].u_ftb_nom, txt])
                    return true
                }else{
                    return "existe_plus"
                }    
            }catch(err){
                console.log(`Erreur survenue lors de l'ajout de la vidéo: ${err}.`)
                return false
            }finally{
                conn.release()
            }
        }else if(token_ip != _ip){return "ip"}
    }
}

// Obtenir la liste des commentaires d'une vidéo
export async function v_commentaires_list(ID_video){
    const conn = await getConn()
    try{ 
        const video_exist = await conn.query("SELECT c_auth_fk, c_txt FROM commentaires WHERE c_video_id_fk =?", [ID_video])
        console.log(video_exist)
        if(video_exist.length > 0){
            return video_exist
        }else{
            return "existe_plus"
        }    
    }catch(err){
        console.log(`Erreur survenue lors de l'ajout de la vidéo: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// Obtenir les données de la chaîne associée à la vidéo ( nom de chaîne, statistiques et vidéos)...
export async function v_chaine_infos(ID_video){
    const conn = await getConn()
    try{ 
        const auth_exist = await conn.query("SELECT v_auth_fk FROM videos WHERE v_id =?", [ID_video])
        const auth_infos = await conn.query("SELECT u_ftb_nom, u_description, u_pp, u_t_commentaires, u_t_jaimes, u_t_abos, u_t_vues FROM utilisateurs WHERE u_ftb_nom =?", [auth_exist[0].v_auth_fk])
        const freetube_channel_videos = await conn.query(`
            SELECT v_id, v_titre, v_auth_fk, v_miniature, v_video, v_description, v_tag1, v_tag2, v_tag3, v_tag4, v_tag5, 
            v_tag6, v_tag7, v_tag8, v_tag9, v_tag10, v_categorie_fk, v_t_jaimes, v_t_commentaires, v_t_vues, v_DATE
            FROM videos WHERE v_statut =1 AND DATE(v_DATE) <= CURDATE() AND v_auth_fk =?`, [auth_exist[0].v_auth_fk])
        console.log(auth_infos)
        if(auth_exist.length > 0){
            return {channel_info: auth_infos, channel_videos: freetube_channel_videos}
        }else{
            return "existe_plus"
        }    
    }catch(err){
        console.log(`Erreur survenue lors de l'ajout de la vidéo: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// Créer une playlist
export async function v_creer_playlist(u_token, _ip, playlist_nom){
    const conn = await getConn()
    const decode = await token_verif(u_token)
    console.log("decode:",decode)
    if(decode == false){
        console.log(`Token expiré`)
        return "exp"
    }else{
        const token_ip = await decrypt_txt(decode.nn)
        const token_id = await decrypt_txt(decode.n)
        if(token_ip == _ip){
            try{ 
                const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id =?",[token_id])                    
                if(ftb_nom.length > 0){
                    await conn.query("INSERT INTO plalist_noms(pn_nom, pn_auth_fk) VALUES(?,?)", [playlist_nom, ftb_nom[0].u_ftb_nom])
                    return true
                }else{
                    return "existe_plus"
                }    
            }catch(err){
                console.log(`Erreur survenue lors de la création de la vidéo: ${err}.`)
                return false
            }finally{
                conn.release()
            }
        }else if(token_ip != _ip){return "ip"}
    }
}

// Ajouter une vidéo à une playlist
export async function v_ajoutPlaylist(u_token, _ip, ID_video, id_playlist){
    const conn = await getConn()
    const decode = await token_verif(u_token)
    console.log("decode:",decode)
    if(decode == false){
        console.log(`Token expiré`)
        return "exp"
    }else{
        const token_ip = await decrypt_txt(decode.nn)
        const token_id = await decrypt_txt(decode.n)
        if(token_ip == _ip){
            try{ 
                const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id =?",[token_id])                    
                const playlist_exist = await conn.query("SELECT * FROM plalist_noms WHERE pn_id =? AND pn_auth_fk =?", [id_playlist, ftb_nom[0].u_ftb_nom])
                const video_exist = await conn.query("SELECT * FROM videos WHERE v_id =?", [ID_video])
                if(video_exist.length > 0 && playlist_exist.length > 0){
                    await conn.query("INSERT INTO playlists(p_pn_id_fk, p_v_id_fk) VALUES(?,?)", [id_playlist, ID_video])
                    return true
                }else{
                    return "existe_plus"
                }    
            }catch(err){
                console.log(`Erreur survenue lors de l'ajout de la vidéo: ${err}.`)
                return false
            }finally{
                conn.release()
            }
        }else if(token_ip != _ip){return "ip"}
    }
}

// Récupérer l'entièreté de ses playlists (nom de la playlist, vidéos...)
//**debug asynchrone... */
export async function v_list_playlist(u_token, _ip){
    const conn = await getConn()
    const decode = await token_verif(u_token)
    console.log("decode:",decode)

    if(decode == false){
        console.log(`Token expiré`); return "exp"
    }else{
        const token_ip = await decrypt_txt(decode.nn)
        const token_id = await decrypt_txt(decode.n)

        if(token_ip == _ip){
            try{ 
                const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id = ?", [token_id])
                if(ftb_nom.length > 0){
                    function Playlist(idPlaylist, nomPlaylist, videosList){this.idPlaylist = idPlaylist; this.nomPlaylist = nomPlaylist; this.videosList = videosList}
                    let Playlist_ = []
                    const playlist_nom = await conn.query("SELECT pn_id, pn_nom FROM plalist_noms WHERE pn_auth_fk = ?", [ftb_nom[0].u_ftb_nom])
                    console.log("playlist_nom:", playlist_nom)
                    Playlist_ = await Promise.all(playlist_nom.map(async (e)=>{const _VideoList = await conn.query(`
                            SELECT v_id, v_titre, v_auth_fk, v_miniature, v_video, v_description, v_tag1, v_tag2, v_tag3, v_tag4, v_tag5, v_tag6, v_tag7, 
                            v_tag8, v_tag9, v_tag10, v_categorie_fk, v_t_jaimes, 
                            v_t_commentaires, v_t_vues, v_DATE 
                            FROM videos 
                            INNER JOIN playlists ON videos.v_id = playlists.p_v_id_fk 
                            WHERE p_pn_id_fk = ?`,
                            [e.pn_id])
                        return new Playlist(e.pn_id, e.pn_nom, _VideoList)
                    })); console.log("\n\nplaylist:", Playlist_)
                    return Playlist_
                }else{return "existe_plus"}    
            }catch(err){
                console.log(`Erreur survenue lors de l'ajout de la vidéo: ${err}.`)
                return false
            }finally{
                conn.release()
            }
        }else if(token_ip != _ip){return "ip"}}}

// Supprimer une playlist
export async function v_supp_playlist(u_token, _ip, playlist_ID){
    const conn = await getConn()
    const decode = await token_verif(u_token)
    console.log("decode:",decode)
    if(decode == false){
        console.log(`Token expiré`)
        return "exp"
    }else{
        const token_ip = await decrypt_txt(decode.nn)
        const token_id = await decrypt_txt(decode.n)
        if(token_ip == _ip){
            try{ 
                const ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id =?",[token_id])
                const playlist_Nom = await conn.query("SELECT * FROM plalist_noms WHERE pn_auth_fk =? AND pn_id =?", [ftb_nom[0].u_ftb_nom, playlist_ID])                    
                if(ftb_nom.length > 0 && playlist_Nom[0].pn_nom != 'À consulter plus tard' && playlist_Nom[0].pn_nom != 'Historique' && playlist_Nom[0].pn_nom != 'jaime'){
                    await conn.query("DELETE FROM plalist_noms WHERE pn_auth_fk =? AND pn_id =?", [ftb_nom[0].u_ftb_nom, playlist_ID])
                    return true
                }else{
                    console.log(`Soit la playlist n'existe plus, soit vous essayez de supprimer une playlist par défaut...`)
                    return "existe_plus"
                }    
            }catch(err){
                console.log(`Erreur survenue lors de la suppression de la vidéo: ${err}.`)
                return false
            }finally{
                conn.release()
            }
        }else if(token_ip != _ip){return "ip"}
    }
}

// Obtenir des recommandations (utilisateur authentifié)
export async function v_recommendations_auth(u_token, _ip){
    const conn = await getConn()
    const decode = await token_verif(u_token)
    console.log("decode:",decode)
    if(decode === false){
        console.log("Token expiré")
        return "exp"
    }
    const token_ip = await decrypt_txt(decode.nn)
    const token_id = await decrypt_txt(decode.n)
    if(token_ip !== _ip){
        return "ip"
    }
    try{
        const db_ftb_nom = await conn.query("SELECT u_ftb_nom FROM utilisateurs WHERE u_id =?",[token_id])
        if(db_ftb_nom.length == 0){
            return "existe_plus"
        }
        const ftb_nom = db_ftb_nom[0].u_ftb_nom
        console.log("ftb_nom:",ftb_nom)
        const playlistVideosResult = await conn.query(`
            SELECT p_v_id_fk
            FROM playlists
            INNER JOIN plalist_noms ON playlists.p_pn_id_fk = plalist_noms.pn_id
            WHERE plalist_noms.pn_auth_fk =?`,[ftb_nom])
        if(playlistVideosResult.length == 0){
            const db_videos = await conn.query(`
                SELECT v_id, v_titre, v_auth_fk, v_miniature, v_video, v_description, v_tag1, v_tag2, v_tag3, v_tag4, v_tag5, 
                v_tag6, v_tag7, v_tag8, v_tag9, v_tag10, v_categorie_fk, v_t_jaimes, v_t_commentaires, v_t_vues, v_DATE
                FROM videos WHERE v_statut =1 AND DATE(v_DATE) <= CURDATE()`)
            return db_videos
        }
        const videoIds = playlistVideosResult.map(e=>e.p_v_id_fk)
        const videos_queryID = videoIds.map(()=>'?').join(', ')
        const videoRecommendationsResult = await conn.query(`
            SELECT v_id, v_titre, v_auth_fk, v_miniature, v_video, v_description, v_tag1, v_tag2, v_tag3, v_tag4, v_tag5, 
            v_tag6, v_tag7, v_tag8, v_tag9, v_tag10, v_categorie_fk, v_t_jaimes, v_t_commentaires, v_t_vues, v_DATE
            FROM videos
            WHERE v_id NOT IN (${videos_queryID}) AND v_statut = 1 AND DATE(v_DATE) <= CURDATE()`,videoIds)
        console.log("videoRecommendations:",videoRecommendationsResult)
        return videoRecommendationsResult
    }catch(err){
        return false
    }finally{
        conn.release()
    }
}

//**  Utilisateurs non-authentifiés   ------------------------------------------------------------------------------    */

// Ajouter une vue à une vidéo
export async function v_vues(Id_video){
    const conn = await getConn()
    try{ 
        const video_exist = await conn.query("SELECT v_id FROM videos WHERE v_id =?",[Id_video])                    
        if(video_exist.length > 0){
            await conn.query("UPDATE videos SET v_t_vues = v_t_vues +1 WHERE v_id =?",[Id_video])
            return true
        }else{
            return "existe_plus"}
    }catch(err){
        console.log(`Erreur survenue lors de l'ajout de vues à la vidéo: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// Obtenir la liste des top créateurs
export async function v_top_créateurs(){
    const conn = await getConn()
    try{                   
        const db_top_createurs = await conn.query(`SELECT u_pp, u_ftb_nom, u_description 
            FROM utilisateurs WHERE u_t_jaimes > 1 AND u_t_abos > 1 AND u_t_vues > 1 
            ORDER BY u_t_jaimes DESC, u_t_abos DESC, u_t_vues DESC
            LIMIT 10`)
        console.log(db_top_createurs)
        return db_top_createurs
    }catch(err){
        console.log(`Erreur survenue lors de la récupération de la liste des top créateurs: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// Obtenir la liste des  vidéos d'un top créateurs
export async function v_top_créateurs_videos( createur_nom){
    const conn = await getConn()
    try{                  
        const db_top_createurs_videos = await conn.query(
        `SELECT v_id, v_titre, v_auth_fk, v_miniature, v_video, v_description, v_tag1, 
            v_tag2, v_tag3, v_tag4, v_tag5, v_tag6, v_tag7, 
            v_tag8, v_tag9, v_tag10, v_categorie_fk, v_t_jaimes, v_t_commentaires, v_t_vues, v_DATE 
            FROM videos 
            WHERE v_statut = 1 AND v_auth_fk =?
            AND DATE(v_DATE) <= CURDATE()`, [createur_nom])
        console.log(db_top_createurs_videos)
        return db_top_createurs_videos
    }catch(err){
        console.log(`Erreur survenue lors de la récupération de la liste des top créateurs: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// --- 1 Obtenir des recommandations (non-authentifiés) | permet d'avoir la liste des mots-clés utilisés
export async function v_recommendations(){
    const conn = await getConn()
    try{                   
        const db_recommendations = await conn.query("SELECT vt_nom FROM vtags ORDER BY vt_t DESC LIMIT 3")
        console.log(db_recommendations)
        return db_recommendations
    }catch(err){
        console.log(`Erreur survenue lors de la récupération des mots-clés: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

//   -- 2 Permet d'obtenir les vidéo utilisants ces mots-clés
export async function v_recommendations_videos(){
const conn = await getConn()
    try{const db_tags = await conn.query("SELECT vt_nom FROM vtags ORDER BY vt_t DESC LIMIT 3")
        if(db_tags.length == 0){null}
        const tagsList = db_tags.map(tag => `'${tag.vt_nom}'`).join(', ')
        const db_videos = await conn.query(`SELECT v_id, v_titre, v_auth_fk, v_miniature, v_video, v_description, v_tag1, 
            v_tag2, v_tag3, v_tag4, v_tag5, v_tag6, v_tag7, 
            v_tag8, v_tag9, v_tag10, v_categorie_fk, v_t_jaimes, v_t_commentaires, v_t_vues, v_DATE FROM videos 
            WHERE v_statut = 1 
            AND DATE(v_DATE) <= CURDATE()
            AND (v_tag1 IN (${tagsList}) OR v_tag2 IN (${tagsList}) OR v_tag3 IN (${tagsList}) OR v_tag4 IN (${tagsList}) OR 
                v_tag5 IN (${tagsList}) OR v_tag6 IN (${tagsList}) OR v_tag7 IN (${tagsList}) OR 
                v_tag8 IN (${tagsList}) OR v_tag9 IN (${tagsList}) OR v_tag10 IN (${tagsList}))`)
        console.log("db_videos:", db_videos)
        return db_videos
    }catch(err){
        console.log(`Erreur survenue lors de la récupération des vidéos associés aux mots clés: ${err}.`)
        return false
    }finally{
        conn.release()
    }}

//** Authentifiés ou pas ------------------------------------------------------------------------------ *//

// Obtenir la liste des vidéos en tendance
export async function v_tendances(){
    const conn = await getConn()
    try{                   
        const db_tendances_videso = await conn.query(
            `SELECT v_id, v_titre, v_auth_fk, v_miniature, v_video, v_description, v_tag1, v_tag2, v_tag3, v_tag4, v_tag5, v_tag6, v_tag7, v_tag8, v_tag9, v_tag10, v_categorie_fk, v_t_jaimes, v_t_commentaires, v_t_vues, 
            v_statut, v_DATE FROM videos 
            WHERE v_statut = 1 AND DATE(v_DATE) <= CURDATE()
            ORDER BY v_t_jaimes DESC, v_t_commentaires DESC, v_t_vues DESC`)
        const tendances_videos = []
        db_tendances_videso.forEach(video=> {
            if(video.v_statut == 1){
                tendances_videos.push(video)
            }else{null}
        })
         if(tendances_videos.length > 0){return tendances_videos}else{ return null}
    }catch(err){
        console.log(`Erreur survenue lors de la récupération des vidéos en tendance: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}

// Obtenir les infos d'une vidéo, lien partagé
export async function v_partage(id_videos){
    const conn = await getConn()
    try{                   
        const db_partage_data = await conn.query(
            `SELECT v_id, v_titre, v_auth_fk, v_miniature, v_video, v_description, v_tag1, v_tag2, v_tag3, v_tag4, v_tag5, v_tag6, v_tag7, v_tag8, v_tag9, v_tag10, v_categorie_fk, v_t_jaimes, v_t_commentaires, v_t_vues, 
            v_statut, v_DATE FROM videos 
            WHERE v_statut = 1 AND DATE(v_DATE) <= CURDATE() AND v_id =?
            ORDER BY v_t_jaimes DESC, v_t_commentaires DESC, v_t_vues DESC`, [id_videos])
        const data_videos = []
        db_partage_data.forEach(video=> {
            if(video.v_statut == 1){
                data_videos.push(video)
            }else{null}
        })
         if(data_videos.length > 0){return data_videos}else{ return null}
    }catch(err){
        console.log(`Erreur survenue lors de la récupération de la vidéo via lien de partage: ${err}.`)
        return false
    }finally{
        conn.release()
    }
}