<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import VideoPlayer from '../components/VideoPlayer.vue';
import { ElMessage } from 'element-plus';

// Gestion profil freetube
const router = useRouter()
const urlImageLecture = new URL('/play.png', import.meta.url).href
const urlImageProfilParDefaut = new URL('/edit-user.png', import.meta.url).href
const lien = 'http://localhost:3300/'
const courriel = ref('')
const motDePasse = ref('')
const urlPhotoProfil = ref('urlImageProfilParDefaut')
const photoProfil = ref(null)
const statsChaine = ref({
  u_ftb_nom: '',
  u_description: '',
  u_pp: '',
  u_t_abos: 0,
  u_t_commentaires: 0,
  u_t_jaimes: 0,
  u_t_vues: 0})
const playlistHistorique = ref([])
const pageActuelle = ref(1)
const elementsParPage = 6
const afficherLecteurVideo = ref(false)
const videoSelectionne = ref({})
const videosPagines = computed(() => {
  const debut = (pageActuelle.value - 1) * elementsParPage
  return playlistHistorique.value.slice(debut, debut + elementsParPage)})
const nombreTotalPages = computed(() => Math.ceil(playlistHistorique.value.length / elementsParPage))
const recupererStatsChaineEtHistorique = async () => {
  try {
    const token = localStorage.getItem('token') || ''
    if (!token) {
      console.warn('Token manquant, redirection vers la page d\'accueil.')
      router.push('/')
      return}
    const responseStats = await axios.post(
      `${lien}FreeTube/API/Utilisateurs/Statistiques`,
      {},
      { headers: { Token: token } })

    if (responseStats.data?.reponse?.length > 0) {
      const stats = responseStats.data.reponse[0]
      statsChaine.value = {
        u_ftb_nom: stats.u_ftb_nom || '',
        u_description: stats.u_description || '',
        u_pp: stats.u_pp || '',
        u_t_abos: stats.u_t_abos || 0,
        u_t_commentaires: stats.u_t_commentaires || 0,
        u_t_jaimes: stats.u_t_jaimes || 0,
        u_t_vues: stats.u_t_vues || 0}}
    const responseHistorique = await axios.post(`${lien}FreeTube/API/Playlist/Playlists`, {}, {
      headers: { Token: token }})
    const playlists = responseHistorique.data.reponse
    const historique = playlists.find(playlist => playlist.nomPlaylist.toLowerCase() === 'historique')
    if (historique) {
      playlistHistorique.value = historique.videosList.map(video => ({
        ...video,
        videoUrl: `${lien}${video.v_video}`,
        miniatureUrl: `${lien}${video.v_miniature}`}))}
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques et de la playlist Historique :', error)}}
const ouvrirLecteurVideo = (video) => {
  videoSelectionne.value = {
    id: video.v_id || null,
    titre: video.v_titre || '',
    url: video.videoUrl || '',
    auteur: video.v_auth_fk || '',
    description: video.v_description || '',
    likes: video.v_t_jaimes || 0,
    vues: video.v_t_vues || 0,
    commentaires: video.v_t_commentaires || 0};
  afficherLecteurVideo.value = true;};
const fermerLecteurVideo = () => {
  afficherLecteurVideo.value = false;};
const handleVideoPlayerClose = () => {
  fermerLecteurVideo();};

const changerPage = (page) => {
  if (page >= 1 && page <= nombreTotalPages.value) {
    pageActuelle.value = page}}

const mettreAJourNom = async () => {
  try {
    const token = localStorage.getItem('token') || ''
    await axios.put(`${lien}FreeTube/API/Utilisateurs/Modif/Nom`, {}, {
      headers: {
        'Token': token,
        'NouvNom': statsChaine.value.u_ftb_nom
      }})
    ElMessage.success('Le nom de votre chaîne a été mis à jour..');} catch (error) {
    console.error('Erreur lors de la mise à jour du nom :', error)}}

const mettreAJourEmail = async () => {
  try {
    const token = localStorage.getItem('token') || ''
    await axios.put(`${lien}FreeTube/API/Utilisateurs/Modif/Email`, {}, {
      headers: {
        'Token': token,
        'NouvEmail': courriel.value
      }})
    ElMessage.success('Votre email a été mis à jour..');} catch (error) {
    console.error('Erreur lors de la mise à jour de l\'email :', error)}}

const mettreAJourMotDePasse = async () => {
  if (!motDePasse.value) return
  try {
    const token = localStorage.getItem('token') || ''
    await axios.put(`${lien}FreeTube/API/Utilisateurs/Modif/Passwd`, {}, {
      headers: {
        'Token': token,
        'NouvPass': motDePasse.value}})
    ElMessage.success('Votre email a été mis à jour..');} catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe :', error)}}
const mettreAJourDescription = async () => {
  try {
    const token = localStorage.getItem('token') || ''
    await axios.put(`${lien}FreeTube/API/Utilisateurs/Modif/Descrip`, {}, {
      headers: {
        'Token': token,
        'Description': statsChaine.value.u_description
      }})
    ElMessage.success('Votre description a été mis à jour..');
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la description :', error)
  }}
const supprimerCompte = async () => {
  try {
    const token = localStorage.getItem('token') || ''
    await axios.delete(`${lien}FreeTube/API/Utilisateurs/Supp/Compte`, {
      headers: {
        'Token': token
      }})
    ElMessage.success('Votre compte a été supprimé..');} catch (error) {
    console.error('Erreur lors de la suppression du compte utilisateur :', error)}}
onMounted(() => {
  recupererStatsChaineEtHistorique()})
</script>

<template>
   <div v-if="!afficherLecteurVideo"  class="container-profile mt-5">
    <!-- statistiques -->
    <div class="profile-section mt-4">
      <div class="card mb-4 bg-dark text-white">
        <div class="card-body text-center">
          <div class="d-flex justify-content-center align-items-center mb-3">
            <div class="profile-picture-preview">
        <img :src= "`${lien}${statsChaine.u_pp}` || urlImageProfilParDefaut" alt="Photo de Profil" class="img-thumbnail">
        <router-link to="/mpp" class="btn btn-dark" style="width:100%;margin-top: 25px;">Modifier votre photo de Profil</router-link>
            </div>
            <div class="ms-3">
              <h4>{{ statsChaine.u_ftb_nom || 'Nom de la chaîne' }}</h4>
              <p>{{ statsChaine.u_description || 'Description de la chaîne' }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row text-white">
  <div class="col-12 col-sm-6 col-md-3 mb-3" v-for="(stat, index) in ['Abonnés', 'Vues', 'J\'aime', 'Commentaires']" :key="index">
    <div class="card ml">
      <div class="card-body text-center">
        <h5 class="card-title">{{ stat }}</h5>
        <p class="card-text statscustomstyle">
          {{ [statsChaine.u_t_abos, statsChaine.u_t_vues, statsChaine.u_t_jaimes, statsChaine.u_t_commentaires][index] }}
        </p>
      </div>
    </div>
  </div>
</div>
</div>            <div class="">
      <h2 class="text-center mb-4">Playlist Historique</h2>
      <div v-if="playlistHistorique.length > 0">
        <div class="row d-flex g-4">
          <div class="col-12 col-md-6 col-lg-4 d-flex justify-content-center" v-for="video in videosPagines" :key="video.v_id">
            <div class="card h-100 shadow-sm d-flex flex-column justify-content-between">
              <div class="card-body">
                <div class="position-relative">
                  <img 
                    :src="video.miniatureUrl" 
                    class="d-block w-100"
                    :alt="`Miniature de ${video.v_titre}`"
                    style="object-fit: cover; height: 200px; width: 100%;"/>
                  <button 
                    @click="ouvrirLecteurVideo(video)" 
                    class="play-button btn btn-light position-absolute top-50 start-50 translate-middle"
                    style="border-radius: 50%; padding: 0; width: 50px; height: 50px;">
                    <img :src="urlImageLecture" class="play-image" style="width: 100%; height: 100%;"/>
                  </button>
                </div>
                <div class="mt-3">
                  <h5 class="card-title text-truncate">{{ video.v_titre }}</h5>
                  <p class="card-text text-truncate">{{ video.v_description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      <div v-else>
        <p class="text-center">Aucune vidéo dans la playlist Historique.</p>
      </div>
    </div>
    <div class="d-flex justify-content-end mt-3">
      <router-link to="/Playlist" class="btn btn-dark" style="width:100%">Autre Playlist</router-link>
    </div>
   <div class="accordion mt-4" id="profileAccordion">
      <div class="accordion-item">
        <h2 class="accordion-header" id="headingNom">
          <button class="accordion-button collapsed bg-dark text-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapseNom" aria-expanded="false" aria-controls="collapseNom">
            Modifier le nom d'utilisateur
          </button>
        </h2>
        <div id="collapseNom" class="accordion-collapse collapse" aria-labelledby="headingNom" data-bs-parent="#profileAccordion">
          <div class="accordion-body bg-secondary">
            <input type="text" class="form-control mb-3" v-model="statsChaine.u_ftb_nom" placeholder="Entrez votre nom d'utilisateur">
            <button type="button" class="btn btn-primary" @click="mettreAJourNom">Mettre à jour le nom</button>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header" id="headingEmail">
          <button class="accordion-button collapsed bg-dark text-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEmail" aria-expanded="false" aria-controls="collapseEmail">
            Modifier l'email
          </button>
        </h2>
        <div id="collapseEmail" class="accordion-collapse collapse" aria-labelledby="headingEmail" data-bs-parent="#profileAccordion">
          <div class="accordion-body bg-secondary">
            <input type="email" class="form-control mb-3" v-model="courriel" placeholder="Entrez votre email">
            <button type="button" class="btn btn-primary" @click="mettreAJourEmail">Mettre à jour l'email</button>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header" id="headingMotDePasse">
          <button class="accordion-button collapsed bg-dark text-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapseMotDePasse" aria-expanded="false" aria-controls="collapseMotDePasse">
            Modifier le mot de passe
          </button>
        </h2>
        <div id="collapseMotDePasse" class="accordion-collapse collapse" aria-labelledby="headingMotDePasse" data-bs-parent="#profileAccordion">
          <div class="accordion-body bg-secondary">
            <input type="password" class="form-control mb-3" placeholder="Laissez vide si vous ne voulez pas changer" v-model="motDePasse">
            <button type="button" class="btn btn-primary" @click="mettreAJourMotDePasse">Mettre à jour le mot de passe</button>
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header" id="headingDescription">
          <button class="accordion-button collapsed bg-dark text-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDescription" aria-expanded="false" aria-controls="collapseDescription">
            Modifier la description de la chaîne
          </button>
        </h2>
        <div id="collapseDescription" class="accordion-collapse collapse" aria-labelledby="headingDescription" data-bs-parent="#profileAccordion">
          <div class="accordion-body bg-secondary">
            <textarea class="form-control mb-3" v-model="statsChaine.u_description" rows="3" placeholder="Décrivez votre chaîne"></textarea>
            <button type="button" class="btn btn-primary" @click="mettreAJourDescription">Mettre à jour la description</button>
          </div></div></div></div>
    <div class="form-group mt-4">
      <button type="button" class="btn btn-danger btn-lg w-100" style="margin-bottom: 150px;" @click="supprimerCompte">Supprimer mon compte</button>
    </div>
  </div>

  <div v-else>
      <VideoPlayer 
        :video-id="videoSelectionne.id" 
        :video-title="videoSelectionne.titre" 
        :video-url="videoSelectionne.url" 
        :v_auth_fk="videoSelectionne.auteur" 
        :v_description="videoSelectionne.description" 
        :v_t_jaimes="videoSelectionne.likes" 
        :v_t_vues="videoSelectionne.vues" 
        :v_t_commentaires="videoSelectionne.commentaires" 
        @close="handleVideoPlayerClose"/>
    </div>
</template>
<style scoped>
.container-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background-color: transparent;
  border-radius: 12px;
}.profile-section {
  padding: 25px;
  border-radius: 8px;
}.card {
  background-color: rgba(255, 255, 255, 0.014);
  border:none;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}.card-title, .accordion-button {
  color: #ffffff;
  font-size: 1.2rem;
}.card-text {
  color: #dedede;
}.profile-picture-preview img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
  border: 3px solid #ffffff;
  cursor: pointer;
}.btn {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: #ffffff;
  color: #ffffff;
  transition: background-color 0.3s ease, border-radius 0.3s ease;
  border-radius: 8px;
}.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #ffffff;
  border-radius: 8px;
}.btn:hover {
  background-color: #ffffff;
  color: #000;
}.accordion-button {
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
}.accordion-body {
  background-color: rgba(255, 255, 255, 0.05);
}.ml{
  width: 149px;
  height: 149px;
  background-color: #00000000;
  background-image: linear-gradient(160deg, #00b1e908 0%, #80d0c72e 100%);
  border: none;}
@media (max-width: 769px) {.ml {
    width: 100%;
    height: 100%;}}.mltitre {
  color: #ffffff!important;
  font-size: 0.8rem!important;
  font-weight: 300!important;
}.statscustomstyle {
  font-size: 50px;
  font-weight: 100;
  margin-top: -12px;
}.bg-dark {
  --bs-bg-opacity: 1;
  background-color: rgb(43 56 61) !important;
}input::placeholder, textarea::placeholder {
  color: rgba(255, 255, 255, 0.7); 
  opacity: 1;
}.form-control:focus {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-color: #ffffff !important;
}.accordion {
  --bs-accordion-color: #ffffff;
  --bs-accordion-bg: var(--bs-body-bg);
  --bs-accordion-transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, border-radius 0.15s ease;
  --bs-accordion-btn-color: #ffffff;
  --bs-accordion-btn-bg: #ffffff;
  --bs-accordion-btn-icon: url(data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='#ffffff' stroke='%23212529' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M2 5L8 11L14 5'/%3e%3c/svg%3e);
  --bs-accordion-btn-active-icon: url(data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='#ffffff' stroke='%23052c65' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M2 5L8 11L14 5'/%3e%3c/svg%3e);
  --bs-accordion-btn-focus-box-shadow: 0 0 0 0.25rem rgb(56 80 82);
  --bs-accordion-active-color: #b9b9b9;
  --bs-accordion-active-bg: #364e4f;
}
</style>