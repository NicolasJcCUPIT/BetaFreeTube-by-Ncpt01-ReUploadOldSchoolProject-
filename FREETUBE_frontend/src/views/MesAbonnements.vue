<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRouter } from 'vue-router'; 
import VideoPlayer from '../components/VideoPlayer.vue'; 
import { ElMessage } from 'element-plus';
const router = useRouter(); 
const urlImageLecture = new URL('/play.png', import.meta.url).href;
const abonnements = ref([]);
const pageActuelle = ref(1);
const elementsParPage = 6;
const messageSucces = ref("");
const chargement = ref(true);
const urlImageProfilParDefaut = new URL("/edit-user.png", import.meta.url).href;
const lien = "http://localhost:3300/";
const afficherLecteurVideo = ref(false);
const videoSelectionneId = ref(null);
const videoSelectionneTitre = ref("");
const videoSelectionneUrl = ref("");
const videoSelectionneAuth = ref("");
const videoSelectionneDescription = ref("");
const videoSelectionneLikes = ref(0);
const videoSelectionneViews = ref(0);
const videoSelectionneComments = ref(0);
const abonnementsPagines = computed(() => {
const debut = (pageActuelle.value - 1) * elementsParPage;
return abonnements.value.slice(debut, debut + elementsParPage);});

// Visualisation et gestion des abonnements des utilisateurs freetube
const nombreTotalPages = computed(() => Math.ceil(abonnements.value.length / elementsParPage));
const recupererAbonnements = async () => {
  const token = localStorage.getItem("token") || "";
  if (!token) {
    router.push('/'); 
    return;}
  try {
    const response = await axios.post(
      "http://localhost:3300/FreeTube/API/Utilisateurs/Actualites",
      {},
      { headers: { Token: token } });
    console.log("Données d'abonnements récupérées:", response.data);
    const abonnementsUniques = response.data.reponse.reduce((acc, courant) => {
      let createur = acc.find(ab => ab.v_auth_fk === courant.v_auth_fk);
      if (!createur) {
        createur = { v_auth_fk: courant.v_auth_fk, videos: [], photo_profil: urlImageProfilParDefaut };
        acc.push(createur);}
      createur.videos.push(courant);
      return acc;}, []);
    for (let abonnement of abonnementsUniques) {
      for (let video of abonnement.videos) {
        try {
          const infoResponse = await axios.post(
            `${lien}FreeTube/API/Videos/Createur/infos`,
            { id_videos: video.v_id },
            { headers: { Token: token }});
          console.log(`Informations de la chaîne pour la vidéo ${video.v_id}:`, infoResponse.data);
          const channelInfo = infoResponse.data.data.channel_info[0];
          abonnement.photo_profil = channelInfo.u_pp || urlImageProfilParDefaut;
          abonnement.u_ftb_nom = channelInfo.u_ftb_nom;} catch (error) {
          console.error(`Erreur lors de la récupération des informations de la chaîne pour la vidéo ${video.v_id}:`, error);
        }}}
    abonnements.value = abonnementsUniques;} catch (error) {
    console.error("Erreur lors de la récupération des abonnements:", error);} finally {chargement.value = false;}};

const seDesabonner = async (nom) => {
  const token = localStorage.getItem("token") || "";
  try {
    await axios.post(
      "http://localhost:3300/FreeTube/API/Utilisateurs/PlusSuivre",
      { createur_nom: nom },
      { headers: { Token: token } });
    messageSucces.value = `Vous vous êtes désabonné de ${nom} avec succès.`;
    recupererAbonnements();
    window.location.reload();} 
    catch (error) {
    console.error("Erreur lors de la désinscription:", error);}};
const ouvrirLecteurVideo = (videoId, videoTitre, videoUrl, videoAuth, videoDescription, videoLikes, videoViews, videoComments) => {
  videoSelectionneId.value = videoId || null;
  videoSelectionneTitre.value = videoTitre || "";
  videoSelectionneUrl.value = videoUrl || "";
  videoSelectionneAuth.value = videoAuth || "";
  videoSelectionneDescription.value = videoDescription || "";
  videoSelectionneLikes.value = videoLikes || 0;
  videoSelectionneViews.value = videoViews || 0;
  videoSelectionneComments.value = videoComments || 0;
  afficherLecteurVideo.value = true;};
const fermerLecteurVideo = () => {
  afficherLecteurVideo.value = false;};
const changerPage = (page) => {
  if (page >= 1 && page <= nombreTotalPages.value) {
    pageActuelle.value = page;}};
onMounted(() => {
  recupererAbonnements();});
</script>

<template>
  <div v-if="!afficherLecteurVideo" class="container mt-5 cont">
    <h1 class="mb-4">Mes Abonnements</h1>
    <div v-if="messageSucces" class="alert alert-success" role="alert">{{ messageSucces }}</div>
    <div v-if="chargement" class="alert alert-dark" role="alert">Chargement des abonnements...</div>
    <div v-if="!chargement && abonnements.length === 0" class="alert alert-info" role="alert">Vous n'êtes abonné à aucun utilisateur pour l'instant.</div>
    <div v-if="!chargement && abonnements.length > 0">
      <div class="row d-flex g-4">
        <div class="col-12 col-md-6 col-lg-4 d-flex justify-content-center" v-for="abonnement in abonnementsPagines" :key="abonnement.v_auth_fk">
          <div class="card h-100 shadow-sm d-flex flex-column justify-content-between">
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <img :src="`${lien}${abonnement.photo_profil}`" alt="Image de profil" class="profile-img ms-3" />
                <div class="flex-grow-1 ms-3">
                  <h5 class="card-title">{{ abonnement.u_ftb_nom }}</h5> 
                </div>
              </div>
              <div v-if="abonnement.videos.length > 0" :id="'carousel-' + abonnement.v_auth_fk" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner">
                  <div class="carousel-item" v-for="(video, index) in abonnement.videos" :class="{ active: index === 0 }" :key="video.v_id">
                    <div class="position-relative">
                      <img 
                        :src="`${lien}${video.v_miniature}`" 
                        class="d-block w-100"
                        :alt="`Miniature de ${video.v_titre}`"
                        style="object-fit: cover; height: 200px; width: 100%;"/>
                      <button 
                        @click="ouvrirLecteurVideo(video.v_id, video.v_titre, `${lien}${video.v_video}`, video.v_auth_fk, video.v_description, video.v_t_jaimes, video.v_t_vues, video.v_t_commentaires)" 
                        class="play-button btn btn-light position-absolute top-50 start-50 translate-middle"
                        style="border-radius: 50%; padding: 0; width: 50px; height: 50px;">
                        <img :src="urlImageLecture" class="play-image" style="width: 100%; height: 100%;"/>
                      </button>
                    </div>
                    <div class="carousel-caption d-none d-md-block">
                      <h5 class="card-title text-truncate">{{ video.v_titre }}</h5>
                      <p class="card-text text-truncate">{{ video.v_description }}</p>
                    </div></div>
                </div>
                <button class="carousel-control-prev" type="button" :data-bs-target="'#carousel-' + abonnement.v_auth_fk" data-bs-slide="prev">
                  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" :data-bs-target="'#carousel-' + abonnement.v_auth_fk" data-bs-slide="next">
                  <span class="carousel-control-next-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Next</span>
                </button>
              </div>
            </div>
            <div class="card-footer bg-transparent border-top-0">
              <button @click="seDesabonner(abonnement.v_auth_fk)" class="btn btn-danger w-100">Se désabonner</button>
            </div>
          </div></div></div>
      <nav v-if="nombreTotalPages > 1" aria-label="Page navigation">
        <ul class="pagination justify-content-center mt-4">
          <li :class="['page-item', { disabled: pageActuelle === 1 }]">
            <a class="page-link" href="#" @click.prevent="changerPage(pageActuelle - 1)">Précédent</a>
          </li>
          <li v-for="page in nombreTotalPages" :key="page" :class="['page-item', { active: page === pageActuelle }]">
            <a class="page-link" href="#" @click.prevent="changerPage(page)">{{ page }}</a></li>
          <li :class="['page-item', { disabled: pageActuelle === nombreTotalPages }]">
          <a class="page-link" href="#" @click.prevent="changerPage(pageActuelle + 1)">Suivant</a>
          </li>
        </ul></nav></div></div>

  <!-- Affichage du lecteur vidéo -->
  <div v-else>
    <VideoPlayer 
      :video-id="videoSelectionneId" 
      :video-title="videoSelectionneTitre" 
      :video-url="videoSelectionneUrl" 
      :v_auth_fk="videoSelectionneAuth" 
      :v_description="videoSelectionneDescription"
      :v_t_jaimes="videoSelectionneLikes"
      :v_t_vues="videoSelectionneViews"
      :v_t_commentaires="videoSelectionneComments"
      @close="fermerLecteurVideo"/>
  </div>
</template>

<style scoped>
.profile-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 12px;
}.card {
  transition: transform 0.2s, box-shadow 0.2s;
    --bs-card-bg: #2d3a3e;
    color: #ffffff;
    width: 100%;
    margin: 10px auto;
    border: none;
}.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}.video-card {
  transition: transform 0.2s, box-shadow 0.2s;
  color: #ffffff;
}.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(45, 48, 52, 0.603);
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 10;
  border-radius: 45px;
}.play-image {
  width: 50px;
  height: 50px;
  display: block;
}.carousel-control-prev-icon,
.carousel-control-next-icon {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}.alert {
  margin-top: 20px;
}.pagination {
  --bs-pagination-padding-x: 0.75rem;
  --bs-pagination-padding-y: 0.375rem;
  --bs-pagination-font-size: 1rem;
  display: flex;
  padding-left: 0;
  list-style: none;
}.page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}.page-link.disabled, .disabled > .page-link {
  pointer-events: none;
  background-color: #00000000;
  border-color: #00000000;
  color: white;
}
.cont {
padding-left: 40px;
padding-right: 40px;
}
@media (max-width: 769px) {
  .cont {
    padding-left: 10px;
padding-right: 10px;
}
}
</style>
