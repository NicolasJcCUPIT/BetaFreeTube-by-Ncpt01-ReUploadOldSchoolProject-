import 'dotenv/config.js'
const API_PORT = process.env.API_PORT
import express from 'express'
import { u_creation , u_exist, u_login, u_modifDescript, u_modifMail, u_modifNom, u_modifPasswd, u_modifPp, u_stats, u_suivre, u_supp, u_plus_suivre, u_actualité, u_check_abo} from './Routes_fonctions/Utilisateurs.mjs'
import multer from 'multer'
import { _miniDirectory, _photosDirectory, _videoDirectory } from './DB/path_assets.mjs'
import path from 'path'
import {v_change_jaime, v_change_video, v_creation, v_ajoutPlaylist, v_creer_playlist, v_supp_playlist, v_list_playlist, v_list_videos, 
v_vues, v_tendances, v_recommendations, v_top_créateurs,
v_commentaires,v_commentaires_list,
v_recommendations_auth,
v_supprimer_video, v_recommendations_videos,
v_partage, v_chaine_infos, v_top_créateurs_videos,
v_list_videos_2,
v_check_like} from './Routes_fonctions/Videos_playlist.mjs'
import { getConn } from './DB/db.mjs'
import dbConnectionCheck from './DB/checkConnect.mjs'
import cors from 'cors'

//** Initialisation de l'API                   ---------------------------------------------------------           **/
export const app = express()
const portAPI = parseInt(API_PORT)
const messageDefaut = `Bienvenu(e) à vous.\nL'api FreeTube écoute actuellement sur le porte ${portAPI}.`
app.listen(portAPI, ()=>{console.log(messageDefaut)})
const baseUri = "/FreeTube/API"
const uriUtilisateurs = `${baseUri}/Utilisateurs`
const uriVideos = `${baseUri}/Videos`
const uriPlaylist = `${baseUri}/Playlist`
import { fileURLToPath } from 'url'
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

// permet aux applications tiers(front) de lire les données static de l'api...
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use('/data', express.static(path.join(__dirname, 'data'))) 
/** Syntaxe : http://localhost:{portAPI}/{path relatif stocké dans la DB} */

//** Routes       gestion des utilisateurs  authentifiés            --------------------------------------------------------------          **/
const _form = multer() // permet de gérer les form/data, car le body n'est pas interprété par express...
// Message de bienvenu
app.get(baseUri, (req, res)=>{
    try{console.log(messageDefaut)
        return res.status(200).json({"reponse": messageDefaut})
    }catch(err){
        console.log(`Erreur survenue lors de la requête sur l'api: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la requête sur l'api: ${err}.`})
    }
})

// Informe si l'utilisateur a accès ou non à la DB
app.get(`${baseUri}/TestConnection`, async (req, res) => {
    const isConnected = await dbConnectionCheck()
    if (isConnected){return res.status(200).json({ "reponse": "connecté" })
    }else {return res.status(500).json({ "reponse": "déconnecté" })}
})

// Création de l'utilisateur
app.post(`${uriUtilisateurs}/Creations`, async (req,res)=>{
    try{
        const u_ftb_nom = req.header("Utilisateur")?.toLowerCase() || ""
    const check_ftb = /^[a-z0-9\.]{4,20}$/
        const u_nom = req.header("Nom")?.toLowerCase() || ""
        const u_prenom = req.header("Prenom")?.toLowerCase() || ""
        const check_noms = /^[a-z]+(-[a-z]*)*$/
        const u_email = req.header("Email")?.toLowerCase() || ""
        const check_email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const u_passwd = req.header("Passwd") || ""
        const check_passwd = /^.{12,}$/ // Recommendation de l'ANSSI(mot de passe de 12 caractères minimum)
        const u_age = parseInt(req.header("Age"))
        if(!check_ftb.test(u_ftb_nom)||!check_noms.test(u_nom)||!check_noms.test(u_prenom)||!check_email.test(u_email)||!check_passwd.test(u_passwd)||u_age<18){
            console.log("Les champs sont vide ou mal renseignés.")
            return res.status(403).json({"reponse": `Les champs sont vide ou mal renseignés.`})
        }else{
            const data = await u_exist(u_email, u_ftb_nom)
            const _data = await u_creation(u_ftb_nom, u_nom, u_prenom, u_email, u_passwd, u_age)
            if(data==null){
                if(_data==true){
                    console.log("L'utilisateur a été créé avec succès.")
                    return res.status(200).json({"reponse":`L'utilisateur ${u_ftb_nom} a été créé avec succès.`})
                }else{
                    console.log(_data)
                    console.log(`Erreur survenue lors de la créaition de l'utilisateur`)
                    return res.status(500).json({"reponse": `Erreur serveur survenue lors de la création de l'utilisateur, veuillez réessayer.`})
                }
            }else{
                console.log(data)
                console.log(`L'utilisateur ${u_ftb_nom} ou l'email ${u_email} existe déjà.`)
                return res.status(403).json({"reponse": `L'utilisateur ${u_ftb_nom} ou l'email ${u_email} existe déjà.`})
            }
        }
    }catch(err){
        console.log(`Erreur survenue lors de la créaition de l'utilisateur: ${err}.`)
        return res.status(500).json({"reponse": `Erreur serveur survenue lors de la création de l'utilisateur, veuillez réessayer.\n Erreur: ${err}.`})
    }
})

// Connexion de l'utilisateur
app.post(`${uriUtilisateurs}/Connexions`, async (req, res)=>{
    try{
        const client_ip = req.ip ; console.log(client_ip)
        const u_email = req.header("Email")?.toLowerCase() || ""
        const check_email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const u_passwd = req.header("Passwd") || ""
        const check_passwd = /^.{12,}$/
        if(!check_email.test(u_email)||!check_passwd.test(u_passwd)){
            console.log("Les champs sont vide ou mal renseignés.")
            return res.status(403).json({"reponse": `Les champs sont vide ou mal renseignés.`})
        }else{
            const data = await u_login(u_email, u_passwd,client_ip)
            if(typeof data=="object"){
                console.log(`Connexion de l'utiisateur ${u_email} réussi.`)
                return res.status(200).json(data)
            }else{
                console.log(data)
                console.log(`Email ou mot de passe incorrecte.`)
                return res.status(403).json({"reponse": `Email ou mot de passe incorrecte.`})
            }
        }
    }catch(err){
        console.log(`Erreur survenue lors de la connexion de l'utilisateur: ${err}`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la connexion de l'utilisateur, veuillez réessayer.\n Erreur: ${err}`})
    }
})

// Modifier son adresse email
app.put(`${uriUtilisateurs}/Modif/Email`, async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    const nouvelEmail = req.header("NouvEmail")?.toLowerCase()
    const checkEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!checkEmail.test(nouvelEmail)){return res.status(403).json({"reponse": `${nouvelEmail} n'est pas une adresse email conforme.`})}
    try{
        const data = await u_modifMail(u_token, nouvelEmail, client_ip)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({"reponse": `Votre email a été changé avec succès.`, email: nouvelEmail})}
    }catch(err){
        console.log(`Erreur survenue lors du changement de votre adresse email: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors du changement de l'adresse email: ${err}.`})
    }
})

// Modifier le mot de passe
app.put(`${uriUtilisateurs}/Modif/Passwd`, async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    const nouvPass = req.header("NouvPass") || ""
    const checkPasswd = /^.{12,}$/
    if(!checkPasswd.test(nouvPass)){return res.status(403).json({"reponse": `${nouvPass} n'est pas un mot de passe valide.`})}
    try{
        const data = await u_modifPasswd(u_token, nouvPass, client_ip )
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({"reponse": `Votre mot de passe a été changé ave succès.`})}
    }catch(err){
        console.log(`Erreur survenue lors du changement de votre adresse email: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors du changement de l'adresse email: ${err}.`})
    }
})

// Modifier la description  de la chaîne freetube
app.put(`${uriUtilisateurs}/Modif/Descrip`, async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    const nouvelDescrip = req.header("Description") || ""
    const checkDescrip = /^.{1,160}$/
    if(!checkDescrip.test(nouvelDescrip)){return res.status(403).json({"reponse": `${nouvDescrip} n'est pas une description conforme.`})}
    try{
        const data = await u_modifDescript(u_token, nouvelDescrip, client_ip)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({"reponse": `Votre description a été changé avec succès.`})}
    }catch(err){
        console.log(`Erreur survenue lors de la mise à jour de votre description de chaîne: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la mise à jour de votre description de chaîne: ${err}.`})
    }
})

// Modifier le nom de la chaîne freetube
app.put(`${uriUtilisateurs}/Modif/Nom`, async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    const nouv_ftb_nom = req.header("NouvNom")?.toLowerCase() || ""
    const check_nouv_ftb = /^[a-z0-9\.]{4,20}$/
    if(!check_nouv_ftb.test(nouv_ftb_nom)){return res.status(403).json({"reponse": `${nouv_ftb_nom} n'est pas un nom de echaîne conforme.`})}
    try{
        const data = await u_modifNom(u_token, nouv_ftb_nom, client_ip)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if(data=="existe"){
            return res.status(403).json({"reponse": "Ce nom de chaîne est déjà utilisé."})
        }else{res.status(200).json({"reponse": `Votre nom de chaîne a été changé avec succès.`})}
    }catch(err){
        console.log(`Erreur survenue lors du changement de nom pour votre chaîne: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors du changement de nom pour votre chaîne: ${err}.`})
    }
})

// Modifier sa photo de profil
const uploadPp = multer({dest: _photosDirectory})
                                // champ "Pp" de type "File", à renseigner dans le body
app.put(`${uriUtilisateurs}/Modif/Pp`,uploadPp.single("Pp"), async (req, res)=>{
    const u_token = req.header("Token")
    const img = req.file
    const client_ip = req.ip
    const nouvPp = req.file.originalname
    const extension = path.extname(req.file.originalname)
    const check_nouvPp = /^[a-zA-Z0-9_\-]{4,}\.[a-zA-Z0-9]+$/
    if(!check_nouvPp.test(nouvPp)){return res.status(403).json({"reponse": `Votre fichier n'est pas conforme.`})}
    try{
        const data = await u_modifPp(u_token, img, client_ip, extension)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({"reponse": data})}
    }catch(err){
        console.log(`Erreur survenue lors du changement de votre photo de profil ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors du changement de votre photo de profil: ${err}.`})
    }
})

// Obtenir les statistiques et autres informations de sa chaîne
app.post(`${uriUtilisateurs}/Statistiques`, async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    try{
        const data = await u_stats(u_token, client_ip)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({"reponse": data})}
    }catch(err){
        console.log(`Erreur survenue lors lors de la récupération de vos statistiques: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la récupération de vos statistiques: ${err}.`})
    }
})

// supprimer son compte utilisateur
app.delete(`${uriUtilisateurs}/Supp/Compte`, async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    try{
        const data = await u_supp(u_token, client_ip)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({"reponse": `Votre compte a été supprimé.`})}
    }catch(err){
        console.log(`Erreur survenue lors du changement de nom pour votre chaîne: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la suppression de votre chaîne freetube: ${err}.`})
    }
})

// Vérifie si un utilisateur est déjà abonné
app.post(`${uriUtilisateurs}/Check/Abonnements`,_form.none(), async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    const createur = req.body.createur_nom
    try{
        const data = await u_check_abo(u_token, client_ip, createur)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(409).json({"reponse": "Vous ne suivez pas ce créateur."})
        }else{res.status(200).json({"reponse": `Vous ne suivez pa ce créateur.`})}
    }catch(err){
        console.log(`Erreur survenue lors de la vérification de votre abonnement à ${createur}: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la vérification de votre abonnement à ${createur}: ${err}.`})
    }
})

// S'abonner à un créateur de contenu (ne peut pas s'abonner à son propre compte)
app.post(`${uriUtilisateurs}/Suivre`,_form.none(), async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    const createur = req.body.createur_nom
    try{
        const data = await u_suivre(u_token, client_ip, createur)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({"reponse": `Vous êtes désormais abonné au créateur`})}
    }catch(err){
        console.log(`Erreur survenue lors de la tentative d'abonnement à la chaîne: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de votre tentative d'abonnement à la chaîne: ${err}.`})
    }
})

// Ne plus suivre
app.post(`${uriUtilisateurs}/PlusSuivre`,_form.none(), async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    const createur = req.body.createur_nom
    try{
        const data = await u_plus_suivre(u_token, client_ip, createur)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({"reponse": `Vous ne suivez plus ce créateur`})}
    }catch(err){
        console.log(`Erreur survenue lorsque vous avez tenté de vous désabonné: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lorsque vous avez tenté de vous désabonné: ${err}.`})
    }
})

// actualités, renvoie la liste des vidéos des créateurs auquels l'utilisateur est abonné.
app.post(`${uriUtilisateurs}/Actualites`,_form.none(), async (req, res)=>{
    const u_token = req.header("Token")
const client_ip = req.ip
    try{
         const data = await u_actualité(u_token, client_ip)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if( data == null){
            return res.status(404).json({"reponse": "Vous n'avez pas encore d'abonnements"})
        }else{res.status(200).json({"reponse": data})}
    }catch(err){
        console.log(`Erreur survenue, impossible d'obtenir votre fil d'actualité: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue, impossible d'obtenir votre fil d'actualité: ${err}.`})
    }
})

//  ---------------------------------------------------------------------------------------------------------------------------------

//** Routes     gestion des videos  utilisateurs authentifiés et non-authentifiés              --------------------------------------------------------------          **/
// Créer une video
const _date_ = new Date() 
const yyyy = _date_.getFullYear().toString()
const MM = (_date_.getMonth() + 1).toString().padStart(2, '0')
const DD = _date_.getDate().toString().padStart(2, '0')
const hh = _date_.getHours().toString().padStart(2, '0')
const mm = _date_.getMinutes().toString().padStart(2, '0')
const ss = _date_.getSeconds().toString().padStart(2, '0')
const default_date = `${yyyy}-${MM}-${DD} ${hh}:${mm}:${ss}`

const medias_video_storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if(file.fieldname== 'miniature'){cb(null, _miniDirectory)}
        else if(file.fieldname =='video'){cb(null, _videoDirectory)}
        else{cb(new Error('Fichier invalide.'))}},
    filename: (req, file, cb) => {
        const extension_imgages = /^\.(jpeg|png|webp|svg|jpg)$/i
        const extension_video = /^\.(mp4|avi|webm)$/i
        if(file.fieldname =='miniature'&&extension_imgages.test(path.extname(file.originalname))){cb(null, file.originalname)}
        else if(file.fieldname =='video'&&extension_video.test(path.extname(file.originalname))){cb(null, file.originalname)}
        else{cb(new Error('Fichier invalide.'))}
    }
})

const medias_video = multer({storage: medias_video_storage})
                                                    // Champs 'miniature' et 'video' à renseigner dans le form-data pour uploader les média de vidéo...
app.post(`${uriVideos}/Creations`, medias_video.fields([{name:'miniature',maxCount:1},{name:'video',maxCount:1}]), async (req, res) => {
    const u_token = req.header("Token")
    const miniature = req.files['miniature'] ? req.files['miniature'][0] : null
    const extension_miniature = miniature ? path.extname(miniature.originalname) : null
    const video = req.files['video'] ? req.files['video'][0] : null
    const extension_video = video ? path.extname(video.originalname) : null
    const titre = req.body.titre || "SANS TITRE"
    const description = req.body.description || "FreeTube video!"
    const visibilite = req.body.visibilite?.toLowerCase() || null // -- 0 pour vidéo privée, 1 pour vidéo publique
    const check_visibilite = /^(oui|non|null)$/
    const plus18  = req.body.majeur?.toLowerCase() || null // -- 0 pour les vidéos plus de 18 ans, 1 pour tout public
    const _date =  req.body.date || default_date   //-- date au format AAAA-MM-JJ HH:MM:SS
    const check_date = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})|null$/
    const check_tag = /^#[a-zA-Z0-9.]{1,19}$/ // -- un tag doit commencer par "#"
    const tag1 = check_tag.test(req.body.tag1)? req.body.tag1?.toLowerCase(): ""
    const tag2 = check_tag.test(req.body.tag2)? req.body.tag2?.toLowerCase(): ""
    const tag3 = check_tag.test(req.body.tag3)? req.body.tag3?.toLowerCase(): ""
    const tag4 = check_tag.test(req.body.tag4)? req.body.tag4?.toLowerCase(): ""
    const tag5 = check_tag.test(req.body.tag5)? req.body.tag5?.toLowerCase(): ""
    const tag6 = check_tag.test(req.body.tag6)? req.body.tag6?.toLowerCase(): ""
    const tag7 = check_tag.test(req.body.tag7)? req.body.tag7?.toLowerCase(): ""
    const tag8 = check_tag.test(req.body.tag8)? req.body.tag8?.toLowerCase(): ""
    const tag9 = check_tag.test(req.body.tag9)? req.body.tag9?.toLowerCase(): ""
    const tag10 = check_tag.test(req.body.tag10)? req.body.tag10?.toLowerCase(): ""
    const categorie = req.body.categorie?.toLowerCase() || "freetube"
    const conn = await getConn()
    const categories_db = await conn.query("SELECT * FROM catfreetube WHERE c_cat_nom =?", [categorie])
    await conn.release()
    const client_ip = req.ip
    console.log("body",req.body)
    try{
        if(!miniature || !video){
            return res.status(403).json({"reponse": "L'un des fichiers (miniature ou vidéo) n'est pas conforme."})
        }if(categories_db.length<=0){
            return res.status(403).json({"reponse": "Cette de catégorie n'existe pas."})
        }if(check_date.test(_date)==false){
            return res.status(403).json({"reponse": "la date n'est pas au bon format"})
        }if(check_visibilite.test(visibilite)==false){
            return res.status(403).json({"reponse": "Le type de visibilité doit être soit 'oui', soit 'non'."})
        }if(check_visibilite.test(plus18)==false){
            return res.status(403).json({"reponse": "La restriction d'âge doit être soit 'oui', soit 'non'."})}
        const data = await v_creation(
            u_token,miniature,video,titre,description,
            tag1,tag2,tag3,tag4,tag5,tag6,tag7,tag8,tag9,tag10,
            categorie,_date,client_ip,extension_miniature,extension_video,visibilite,plus18)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "Votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({"reponse": "Votre vidéo a été créée avec succès."})}
    }catch(err){
        console.log(`Erreur survenue lors de la création de votre vidéo: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la création de votre vidéo: ${err}.`})
    }})


// Obtenir la liste des vidéos de sa chaîne FreeTube
app.post(`${uriVideos}/Mes/videos`,async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    console.log("body",req.body)
    try{
        const data = await v_list_videos(u_token, client_ip)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({"reponse": data})}
    }catch(err){
        console.log(`Erreur survenue lors de la récupération de vos vidéos: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la récupération de vos videos: ${err}.`})
    }
})

const upload = multer() // permet de gérer les form/data, sans quoi le body n'est pas interprété par express...

//   Editer une video
app.put(`${uriVideos}/change/Video`, upload.none(), async (req, res)=>{
    const u_token = req.header("Token")
    const titre = req.body.titre || null
    const description = req.body.description || null
    const _date = req.body.date || null // -- date au format AAAA-MM-JJ HH:MM:SS
    const visibilite = req.body.visibilite?.toLowerCase() || null // -- 0 pour vidéo privée( valeur form/data = non), 1 pour l'inverse(oui)
    const check_visibilite = /^(oui|non|null)$/
    const chekc_description_titre = /^.{4,}|null$/
    const check_date = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})|null$/
    const plus18  = req.body.majeur?.toLowerCase() || null // -- 0 pour les vidéos plus de 18 ans(valeur form/data = oui), 1 pour l'inverse(non)
    const client_ip = req.ip
    const id_video = req.body.id_videos
    const check_id_video = /^\d+$/
    const check_tag = /^#[a-zA-Z0-9.]{1,19}$/ // -- un tag doit commencer par "#" obligatoirement sous peine de refus de l'api...
    const tag1 = check_tag.test(req.body.tag1)? req.body.tag1?.toLowerCase(): ""; const tag2 = check_tag.test(req.body.tag2)? req.body.tag2?.toLowerCase(): "";
    const tag3 = check_tag.test(req.body.tag3)? req.body.tag3?.toLowerCase(): ""; const tag4 = check_tag.test(req.body.tag4)? req.body.tag4?.toLowerCase(): "";
    const tag5 = check_tag.test(req.body.tag5)? req.body.tag5?.toLowerCase(): ""; const tag6 = check_tag.test(req.body.tag6)? req.body.tag6?.toLowerCase(): "";
    const tag7 = check_tag.test(req.body.tag7)? req.body.tag7?.toLowerCase(): ""; const tag8 = check_tag.test(req.body.tag8)? req.body.tag8?.toLowerCase(): "";
    const tag9 = check_tag.test(req.body.tag9)? req.body.tag9?.toLowerCase(): ""; const tag10 = check_tag.test(req.body.tag10)? req.body.tag10?.toLowerCase(): "";
    console.log("body:", req.body)
    try{
        if(chekc_description_titre.test(titre)==false){return res.status(403).json({"reponse": "le champ titre doit contenir au moins 4 caractères ou être vide"})}
        if(chekc_description_titre.test(description)==false){return res.status(403).json({"reponse": "le champ description doit contenir au moins 4 caractères ou être vide"})}
        if(check_date.test(_date)==false){return res.status(403).json({"reponse": "le champ date doit être au format   AAAA-MM-JJ HH:MM:SS ou être vide"})}
        if(check_id_video.test(id_video)==false){return res.status(403).json({"reponse": "l'id doit être un chiffre."})}
         if(check_visibilite.test(visibilite)==false){return res.status(403).json({"reponse": "Le type de visibilité peut-être soit oui, soit non ou vide"})}
          if(check_visibilite.test(plus18)==false){return res.status(403).json({"reponse": "pour indiquer si la video est réservée aux plus de 18 peut-être soit oui, soit non ou vide"})}
        const data = await v_change_video(u_token,client_ip,id_video,titre,description, _date, visibilite,plus18, tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10)
         console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
             return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
             return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if(data=="existe_plus"){
            return res.status(404).json({"reponse": "Il semblerait que la vidéo n'existe pas."})
        }else{res.status(200).json({"reponse": `vos paramètres vidéos ont été changés.`})}
    }catch(err){
        console.log(`Erreur survenue lors de la création de votre vidéo: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la création de votre vidéo: ${err}.`})
    }
})

// Ajouter une des vues à une vidéo (pas besoin d'authentification)
app.put(`${uriVideos}/Vues/Video`,upload.none(), async (req, res)=>{
    const id_video = req.body.id_videos
    const check_id_video = /^\d+$/
    console.log("id:", id_video)
    try{
        if(check_id_video.test(id_video)==false){return res.status(403).json({"reponse": "l'id doit être un chiffre."})}
         const data = await v_vues(id_video); console.log("data:", data)
        if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if(data=="existe_plus"){
            return res.status(404).json({"reponse": "Il semblerait que la vidéo ou la playlist n'existe pas."})
        }else{res.status(200).json({"reponse": `Une vue a été ajouté à votre vidéo`})}
    }catch(err){
        console.log(`Erreur survenue lors de l'ajout d'une vue à cette vidéo: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de l'ajout d'une vue à cette vidéo: ${err}.`})
    }
})

// Commenter une video 
app.post(`${uriVideos}/Commenter`,upload.none(), async (req, res)=>{
    const u_token = req.header("Token")
    const id_video = req.body.id_videos
    const check_id_video = /^\d+$/
    const commentaire = req.body.commentaire
    const client_ip = req.ip
    console.log("id:", id_video)
    try{
        if(check_id_video.test(id_video)==false){return res.status(403).json({"reponse": "l'id doit être un chiffre."})}
        const data = await v_commentaires(u_token, client_ip, id_video, commentaire)
        console.log("data:", data)
        if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if(data=="existe_plus"){
            return res.status(404).json({"reponse": "Il semblerait que la vidéo ou la playlist n'existe pas."})
        }else{res.status(200).json({"reponse": `votre commentaire a été ajouté à votre vidéo`})}
    }catch(err){
        console.log(`Erreur survenue lors de l'ajout d'une vue à cette vidéo: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de l'ajout d'une vue à cette vidéo: ${err}.`})
    }
})

// Supprimer une vidéo
app.delete(`${uriVideos}/Supprimer/Video`,upload.none(), async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    const id_video = req.body.id_videos
    const check_id_video = /^\d+$/
    console.log("id:", id_video)
    try{
        if(check_id_video.test(id_video)==false){return res.status(403).json({"reponse": "l'id doit être un chiffre."})}
        const data = await v_supprimer_video(u_token, client_ip, id_video)
        console.log("data:", data)
        if(data == false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if(data == "existe_plus"){
            return res.status(404).json({"reponse": "Il semblerait que la vidéo ou la playlist n'existe pas."})
        }else if(data== "exp"){
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else{res.status(200).json({"reponse": `Votre vidéo a été supprimé`})}
    }catch(err){
        console.log(`Erreur survenue lors de l'ajout d'une vue à cette vidéo: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de l'ajout d'une vue à cette vidéo: ${err}.`})
    }
})

// Obtenir la liste des commentaires d'une vidéo 
app.post(`${uriVideos}/Commentaires/Liste`,upload.none(), async (req, res)=>{
const id_video = req.body.id_videos
console.log("id:", id_video)
    try{
        const data = await v_commentaires_list(id_video)
        console.log("data:", data)
        if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if(data=="existe_plus"){
            return res.status(404).json({"reponse": "Il semblerait qu'il n'y ai pas de commentaires"})
        }else{res.status(200).json({data})}
    }catch(err){
        console.log(`Erreur survenue lors de l'ajout d'une vue à cette vidéo: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de l'ajout d'une vue à cette vidéo: ${err}.`})
    }
})

// Obtenir les informations de la chaîne associée à la vidéo
app.post(`${uriVideos}/Createur/infos`,upload.none(), async (req, res)=>{
    const id_video = req.body.id_videos
    console.log("id:", id_video)
        try{
            const data = await v_chaine_infos(id_video)
            console.log("data:", data)
            if(data==false){
                return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
            }else if(data=="existe_plus"){
                return res.status(404).json({"reponse": "Il semblerait qu'il n'y ai pas de commentaires"})
            }else{res.status(200).json({data})}
        }catch(err){
            console.log(`Erreur survenue lors de l'ajout d'une vue à cette vidéo: ${err}.`)
            return res.status(500).json({"reponse": `Erreur survenue lors de l'ajout d'une vue à cette vidéo: ${err}.`})
        }
    })

// Obtenir la liste des vidéos ayant générés le plus d'interactions
app.get(`${uriVideos}/Tendances`, async (req, res)=>{
    try{const data = await v_tendances(); console.log("data:", data)
        if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if(data == null){
            return res.status(500).json({"reponse": "Aucu résultat retourné par la DB, il se pourrait qu'il n'y ai aucune vidéo antérieur ou correspondant à la date du jour..."})
        }else{res.status(200).json({"reponse": data})}
    }catch(err){
        console.log(`Erreur survenue lors de la récupérations des vidéos en tendance: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lorsque vous avez tenté de récupérer les vidéos en tendance: ${err}.`})
    }
})

// Obtenir des recommendations (authentifiés)
app.post(`${uriVideos}/Recommendations/Auth`, async (req, res)=>{
const u_token = req.header("Token") 
const client_ip = req.ip
    try{
        const data = await v_recommendations_auth(u_token, client_ip)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if(data=="existe_plus"){
            return res.status(404).json({"reponse": "Il semblerait que votre compte n'existe plus."})
        }else{res.status(200).json({"reponse": data})}
    }catch(err){
        console.log(`Erreur survenue lors de la récupérations de vos recommendations: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la récupérations de vos recommendations: ${err}.`})
    }
})

// Obtenir des tags recommendations (non-authentifiés)
app.get(`${uriVideos}/Recommendations`, async (req, res)=>{
    try{
        const data = await v_recommendations()
        console.log("data:", data)
        if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({data})}
    }catch(err){
        console.log(`Erreur survenue lors de la récupérations des mots-clés les plus utilisés: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la récupérations des mots-clés les plus utilisés: ${err}.`})
    }
})
// Obtenir des recommendations basées sur les mots clés (non-authentifiés)
app.get(`${uriVideos}/Recommendations/videos`, async (req, res)=>{
    try{
        const data = await v_recommendations_videos()
        console.log("data:", data)
        if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({data})}
    }catch(err){
        console.log(`Erreur survenue lors de la récupérations des vidéos contenant les mots-clés les plus utilisés: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la récupérations des vidéos contenant les mots-clés les plus utilisés: ${err}.`})
    }
})

// 1 récupération des top créateurs (non-authentifiés)
app.get(`${uriVideos}/TopCreateurs`, async (req, res)=>{
    try{
        const data = await v_top_créateurs()
        console.log("data:", data)
        if(data ==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({"reponse": data})}
    }catch(err){
        console.log(`Erreur survenue lors de la récupérations de la liste des top créateurs: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la récupérations de la liste des top créateurs: ${err}.`})
    }
})

// 2 récupération des vidéos des top créateurs (non-authentifiés)
app.post(`${uriVideos}/TopCreateurs/videos`, upload.none(), async (req, res)=>{
    const top_createurs_nom = req.body.createur_nom
    try{
        const data = await v_top_créateurs_videos(top_createurs_nom)
        console.log("data:", data)
        if(data ==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else{res.status(200).json({"reponse": data})}
    }catch(err){
        console.log(`Erreur survenue lors de la récupérations de la liste des vidéo pour le top créateurs: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la récupérations de la liste des vidéos pour le top créateurs: ${err}.`})
    }
})

// Récupération des infos d'une vidéo (lien de partage de vidéo) via l'ID de vidéo
app.post(`${uriVideos}/Partage`,upload.none(), async (req, res)=>{
    const id_video = req.body.id_videos
    console.log("id:", id_video)
        try{
            const data = await v_partage(id_video)
            console.log("data:", data)
            if(data ==false){
                return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
            }else{res.status(200).json({data})}
        }catch(err){
            console.log(`Erreur survenue lors de la récupération de la vidéo via lien de partage: ${err}.`)
            return res.status(500).json({"reponse": `Erreur survenue lors de la récupération des informations de la vidéo via lien de partage: ${err}.`})
        }
    })

// Obtenir la liste des vidéos d'une chaîne FreeTube
app.post(`${uriVideos}/Chaine/Videos`,upload.none(),async (req, res)=>{
    const utilisateur_ = req.body.chaine_nom
    console.log("body",req.body)
    try{
        const data = await v_list_videos_2(utilisateur_)
        console.log("data:", data)
        if(data != false){
            return res.status(498).json({"data": data})
        }else{res.status(404).json({"reponse": "Pas de vidéos pour cette chaîne"})}
    }catch(err){
        console.log(`Erreur survenue lors de la récupération des vidéos de la chaîne: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la récupération de vos videos: ${err}.`})
    }
})

//   -------------------------------------------------------------------------------------------------------------------------------------------

//** Routes     gestion des playlist                        --------------------------------------------------------------          **/
// Vérifie si un utilisateur est déjà abonné
app.post(`${uriPlaylist}/Check/Like`,upload.none(), async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    const id_Video = req.body.ID_Video
    try{
        const data = await v_check_like(u_token, client_ip, id_Video)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(409).json({"reponse": "Vous n'avez pas encore liké cette vidéo."})
        }else{res.status(200).json({"reponse": `Vous avez déjà liké cette vidéo.`})}
    }catch(err){
        console.log(`Erreur survenue lors de la vérification de votre abonnement : ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la vérification de votre abonnement : ${err}.`})
    }
})

// Liker une video (l'ajoute automatiquement à la playlist j'aime...)
app.put(`${uriPlaylist}/Like/Video`, upload.none(), async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    const id_video = req.body.id_videos
    const check_id_video = /^\d+$/
    console.log("body:", req.body)
    try{
        if(check_id_video.test(id_video)==false){return res.status(403).json({"reponse": "l'id doit être un chiffre."})}
        const data = await v_change_jaime(u_token,client_ip,id_video)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if(data=="existe_plus"){
            return res.status(404).json({"reponse": "Il semblerait que la vidéo ou la playlist n'existe pas."})
        }else if(data=="déjà liké"){
            return res.status(200).json({"reponse": "Vous avez disliké cette vidéo!"})
        }else{res.status(201).json({"reponse": `vous avez liké cette vidéo.`})}
    }catch(err){
        console.log(`Erreur survenue lors de la création de votre vidéo: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lorsque vous avez tenté de liker la vidéo: ${err}.`})
    }
})

// Créer une playlist
app.post(`${uriPlaylist}/Cree/Playlist`, upload.none(), async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    const playlist_nom = req.body.playlist_nom
    const check_playlist_nom = /^.{1,40}$/
    console.log("body:", req.body)
    try{
        if(check_playlist_nom.test(playlist_nom)==false){return res.status(403).json({"reponse": "Le nom de la playlist ne peut être vide et peut être de 40 caractères maximum"})}
        const data = await v_creer_playlist(u_token,client_ip,playlist_nom)
        console.log("data:", data)
        if(data=="exp"){
                console.log(`Le token a expiré veuillez vous reconnecter`)
                return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if(data=="existe_plus"){
            return res.status(404).json({"reponse": "Il semblerait que votre compte n'existe plus."})
        }else{res.status(200).json({"reponse": `Votre playlist ${playlist_nom} a été créé.`})}
    }catch(err){
        console.log(`Erreur survenue lors de la création de votre vidéo: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la création de la playlist ${playlist_nom}: ${err}.`})
    }
})

// Ajouter une vidéo à une playlist
app.put(`${uriPlaylist}/Ajout/Playlist`, upload.none(), async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    const id_playlist = req.body.id_playlist
    const id_video = req.body.id_videos
    const check_id_video = /^\d+$/
    console.log("body:", req.body)
    try{
    if(check_id_video.test(id_video)==false){return res.status(403).json({"reponse": "l'id doit être un chiffre."})}
    if(check_id_video.test(id_playlist)==false){return res.status(403).json({"reponse": "l'id doit être un chiffre."})}
    const data = await v_ajoutPlaylist(u_token,client_ip,id_video,id_playlist)
    console.log("data:", data)
        if(data=="exp"){console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if(data=="existe_plus"){
            return res.status(404).json({"reponse": "Il semblerait que la vidéo ou la vidéo n'existe pas."})
        }else{res.status(200).json({"reponse": `Vidéo ajouté à votre playlist.`})}
    }catch(err){
        console.log(`Erreur survenue lors de la création de votre vidéo: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de l'ajout de votre vidéo à la playlist: ${err}.`})
    }
})

// supprimer une playlist
app.delete(`${uriPlaylist}/Supp/Playlist`, upload.none(), async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    const playlist_ID = req.body.playlist_ID
    const check_playlist_ID = /^\d+$/
    console.log("body:", req.body)
    try{
        if(check_playlist_ID.test(playlist_ID)==false){return res.status(403).json({"reponse": "Le nom de playlist doit être un nombre."})}
        const data = await v_supp_playlist(u_token, client_ip, playlist_ID); console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
            console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
            return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data== false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if(data=="existe_plus"){
            return res.status(404).json({"reponse": "Il semblerait que votre compte n'existe plus."})
            }else{res.status(200).json({"reponse": `Votre playlistca été supprimé.`})}
    }catch(err){
        console.log(`Erreur survenue lors de la création de votre vidéo: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la suppression de la playlist: ${err}.`})
    }
})

// Récupérer l'entièreté des plyalist utilisateurs (noms et vidéos)
app.post(`${uriPlaylist}/Playlists`, upload.none(), async (req, res)=>{
    const u_token = req.header("Token")
    const client_ip = req.ip
    console.log("body:", req.body)
    try{
    const data = await v_list_playlist(u_token, client_ip)
        console.log("data:", data)
        if(data=="exp"){
            console.log(`Le token a expiré veuillez vous reconnecter`)
            return res.status(498).json({"reponse": "votre session a expiré, veuillez vous reconnecter."})
        }else if(data=="ip"){
                console.log(`Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter.`)
                return res.status(498).json({"reponse": "Votre ip ne correspond pas à celle que vous avez utilisé pour initialiser votre session, veuillez vous reconnecter."})
        }else if(data==false){
            return res.status(500).json({"reponse": "Erreur côté serveur, veuillez réessayer et si cela persiste reconnectez-vous."})
        }else if(data=="existe_plus"){
            return res.status(404).json({"reponse": "Il semblerait que votre compte n'existe plus."})
        }else{res.status(200).json({"reponse": data})}
    }catch(err){
    console.log(`Erreur survenue lors de la récupération de vos playlists: ${err}.`)
        return res.status(500).json({"reponse": `Erreur survenue lors de la récupération de la liste de vos playlist: ${err}.`})
}
})
