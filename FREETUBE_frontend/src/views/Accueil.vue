<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer.vue';
import { ElMessage } from 'element-plus';

// Pas d'accueil de l'app pour tous les utilisateurs (rendu conditionnel)
const urlImageLecture = new URL('/play.png', import.meta.url).href;
const afficherLecteurVideo = ref(false);
const videoSelectionneId = ref(null);
const videoSelectionneTitre = ref("");
const videoSelectionneUrl = ref("");
const videoSelectionneAuth = ref("");
const videoSelectionneDescription = ref("");
const videoSelectionneLikes = ref(0);
const videoSelectionneViews = ref(0);
const videoSelectionneComments = ref(0);
const lien = "http://localhost:3300/";
const magasin = useStore();
const estAuthentifie = computed(() => magasin.getters.isAuthenticated);
const apiUrl = 'http://localhost:3300/FreeTube/API';
const videosTendances = ref([]);
const videosActualites = ref([]);
const videosRecommandees = ref([]);
const tagsRecommandes = ref([]);
const topCreateurs = ref([]);
const etatAbonnement = ref({});

const recupererDonnees = async (url, dataRef, token = null) => {
  try {
    const config = token ? { headers: { Token: token } } : {};
    const response = await axios.get(url, config);
    dataRef.value = response.data.reponse || response.data.data || [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des données depuis ${url}:`, error);
  }
};

const recupererTagsRecommandes = async () => {
  try {
    const response = await axios.get(`${apiUrl}/videos/Recommendations`);
    tagsRecommandes.value = response.data.data.map(tag => tag.vt_nom) || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des tags recommandés :', error);
  }
};

const verifierAbonnement = async (createurNom) => {
  const token = magasin.state.token || '';
  if (!token) return; 
  try {
    const response = await axios.post(`${apiUrl}/Utilisateurs/Check/Abonnements`, {createur_nom: createurNom }, { headers: { 'Token': token }});
    etatAbonnement.value[createurNom] = response.status === 200;
  } catch (error) {
    etatAbonnement.value[createurNom] = false;
  }
};

const gererAbonnement = async (createurNom) => {
  const token = magasin.state.token || '';
  if (!token) {
    ElMessage.error('Veuillez vous connecter.');
    return;
  }
  try {
    const route = etatAbonnement.value[createurNom] ? `${apiUrl}/Utilisateurs/PlusSuivre` : `${apiUrl}/Utilisateurs/Suivre`;
    const response = await axios.post(route, {createur_nom: createurNom}, {headers: { 'Token': token }});
    if (response.status === 200) {
      etatAbonnement.value[createurNom] = !etatAbonnement.value[createurNom];
      ElMessage.success(response.data.reponse);
    } else {
      ElMessage.error(response.data.reponse || 'Erreur lors de la gestion de l\'abonnement.');
    }
  } catch (error) {
    ElMessage.error('Erreur lors de la gestion de l\'abonnement.');
  }
};

const ouvrirLecteurVideo = (videoId, videoTitre, videoUrl, videoAuth, videoDescription, videoLikes, videoViews, videoComments) => {
  videoSelectionneId.value = videoId || null;
  videoSelectionneTitre.value = videoTitre || "";
  videoSelectionneUrl.value = videoUrl || "";
  videoSelectionneAuth.value = videoAuth || "";
  videoSelectionneDescription.value = videoDescription || "";
  videoSelectionneLikes.value = videoLikes || 0;
  videoSelectionneViews.value = videoViews || 0;
  videoSelectionneComments.value = videoComments || 0;
  afficherLecteurVideo.value = true;
};

const fermerLecteurVideo = () => {
  afficherLecteurVideo.value = false;
};

const getBadgeClass = (tag) => {
  const badgeClasses = ['bg-primary', 'bg-secondary', 'bg-success', 'bg-danger', 'bg-warning', 'bg-info'];
  return badgeClasses[Math.floor(Math.random() * badgeClasses.length)];
};

const getTagsWithLimit = (video) => {
  const tags = [video.v_tag1, video.v_tag2, video.v_tag3, video.v_tag4, video.v_tag5, video.v_tag6, video.v_tag7, video.v_tag8, video.v_tag9, video.v_tag10].filter(Boolean); 
  return {displayedTags: tags.slice(0, 2), remainingTagsCount: tags.length > 2 ? tags.length - 2 : 0};
};

const changevueVideoPlayer = async () => {
  fermerLecteurVideo();
  await recupererDonnees(`${apiUrl}/videos/Tendances`, videosTendances);
  await recupererDonnees(`${apiUrl}/videos/TopCreateurs`, topCreateurs);

  if (estAuthentifie.value) {
    try {
      const response = await axios.post(`${apiUrl}/Videos/Recommendations/Auth`, {}, { headers: { 'Token': magasin.state.token } });
      videosRecommandees.value = response.data.reponse || response.data.data || [];
      if (!videosRecommandees.value.length) {
        await recupererDonnees(`${apiUrl}/utilisateurs/Actualites`, videosActualites, magasin.state.token);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des vidéos recommandées pour les utilisateurs authentifiés:', error);
      await recupererDonnees(`${apiUrl}/utilisateurs/Actualites`, videosActualites, magasin.state.token);
    }
  } else {
    await recupererDonnees(`${apiUrl}/videos/Recommendations/videos`, videosActualites);
  }
};

onMounted(async () => {
  await recupererDonnees(`${apiUrl}/videos/Tendances`, videosTendances);
  await recupererDonnees(`${apiUrl}/videos/TopCreateurs`, topCreateurs);
  await recupererDonnees(`${apiUrl}/videos/Recommendations/videos`, videosRecommandees);
  await recupererTagsRecommandes();
  if (estAuthentifie.value) {
    try {
      const response = await axios.post(`${apiUrl}/Videos/Recommendations/Auth`, {}, { headers: { 'Token': magasin.state.token } });
      videosRecommandees.value = response.data.reponse || response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des vidéos recommandées pour les utilisateurs authentifiés:', error);
    }
  } else {
    await recupererDonnees(`${apiUrl}/videos/Recommendations/videos`, videosActualites);
  }
  topCreateurs.value.forEach((createur) => {
    verifierAbonnement(createur.u_ftb_nom);
  });
});
</script>

<template>
  <div class="homepage SD" v-if="!afficherLecteurVideo">
    <h1>Bienvenue sur FreeTube</h1>
    <section class="top-creators mb-5">
      <h2 class="mb-3">Top Créateurs</h2>
      <div class="row">
        <div v-for="creator in topCreateurs" :key="creator.id" class="col-lg-3 col-md-4 col-sm-6 mb-4">
          <div class="card creator-card shadow-sm createurs" style="height: 200px">
            <div class="image-container">
              <img :src="`${lien}${creator.u_pp}`" class="card-img-top profile-picture" :alt="`Photo de profil de ${creator.u_ftb_nom}`" />
            </div>
            <div class="card-body d-flex flex-column align-items-center">
              <h5 class="card-title">
                <router-link style="color: rgb(249 252 255)!important; text-decoration: none!important; font-weight: 500; font-size: 20px;" :to="{ path: `/chaine/${creator.u_ftb_nom}` }">
                  {{ creator.u_ftb_nom }}
                </router-link>
                <p class="description">{{ creator.u_description }}</p>
              </h5>
              <div class="subscription-button-wrapper d-flex justify-content-center align-items-center">
                <button type="button" class="btn btn-dark btn-sm" style="border: none;background-color:#00000000;margin-top:-5px;" @click="gererAbonnement(creator.u_ftb_nom)">
                  <i :class="etatAbonnement[creator.u_ftb_nom] ? 'bi bi-person-dash-fill' : 'bi bi-person-plus-fill'"></i>
                  {{ etatAbonnement[creator.u_ftb_nom] ? 'Abonné' : 'S\'abonner' }}
                </button>
              </div></div></div></div></div>
    </section>
    <section class="tendances mb-5">
      <h2 class="mb-3">Tendances</h2>
      <div class="row">
        <div v-for="video in videosTendances" :key="video.v_id" class="col-lg-3 col-md-4 col-sm-6 mb-4">
          <div class="card video-card h-100 shadow-sm d-flex flex-column">
            <div class="p-2">
              <template v-for="(tag, index) in getTagsWithLimit(video).displayedTags" :key="index">
                <span :class="'badge me-1 ' + getBadgeClass(tag)">{{ tag }}</span>
              </template>
              <span v-if="getTagsWithLimit(video).remainingTagsCount > 0" class="badge bg-secondary">
                +{{ getTagsWithLimit(video).remainingTagsCount }} tags
              </span>
            </div>
            <div class="position-relative">
              <img :src="`${lien}${video.v_miniature}`" class="card-img-top" :alt="`Miniature de ${video.v_titre}`" style="object-fit: cover; height: 200px; width: 100%;" />
              <button @click="ouvrirLecteurVideo(video.v_id, video.v_titre || video.v_nom, `${lien}${video.v_video}`, video.v_auth_fk, video.v_description, video.v_t_jaimes, video.v_t_vues, video.v_t_commentaires)" 
                class="play-button btn btn-light position-absolute top-50 start-50 translate-middle" style="border-radius: 50%; padding: 0; width: 50px; height: 50px;">
                <img :src="urlImageLecture" class="play-image" style="width: 100%; height: 100%;"/>
              </button>
            </div>
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 class="card-title text-truncate">{{ video.v_titre }}</h5>
                <p class="card-text text-truncate">{{ video.v_description }}</p>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <small class="text-muted">{{ video.v_auth_fk }}</small>
                <div class="d-flex align-items-center text-muted">
                  <span class="me-3 d-flex align-items-center"><i class="bi bi-hand-thumbs-up me-1"></i> {{ video.v_t_jaimes }}</span>
                  <span class="d-flex align-items-center"><i class="bi bi-chat-left-text me-1"></i> {{ video.v_t_commentaires }}</span>
                </div></div></div></div></div></div>
    </section>
    <section class="recommendations" v-if="estAuthentifie">
    <h2>Recommandations</h2>
    <div class="row">
      <div v-for="video in videosRecommandees" :key="video.v_id" class="col-lg-3 col-md-4 col-sm-6 mb-4">
        <div class="card video-card h-100 shadow-sm d-flex flex-column">
          <div class="p-2">
            <template v-for="(tag, index) in getTagsWithLimit(video).displayedTags" :key="index">
              <span :class="'badge me-1 ' + getBadgeClass(tag)">{{ tag }}</span>
            </template>
            <span v-if="getTagsWithLimit(video).remainingTagsCount > 0" class="badge bg-secondary">
              +{{ getTagsWithLimit(video).remainingTagsCount }} tags
            </span>
          </div>
          <div class="position-relative">
            <img :src="`${lien}${video.v_miniature}`" class="card-img-top" :alt="`Miniature de ${video.v_titre}`" style="object-fit: cover; height: 200px; width: 100%;" />
            <button @click="ouvrirLecteurVideo(video.v_id, video.v_titre || video.v_nom, `${lien}${video.v_video}`, video.v_auth_fk, video.v_description, video.v_t_jaimes, video.v_t_vues, video.v_t_commentaires)"
              class="play-button btn btn-light position-absolute top-50 start-50 translate-middle" style="border-radius: 50%; padding: 0; width: 50px; height: 50px;">

              <img :src="urlImageLecture" class="play-image" style="width: 100%; height: 100%;"/>
            </button>
          </div>
          <div class="card-body d-flex flex-column justify-content-between">
            <div>
              <h5 class="card-title text-truncate">{{ video.v_titre }}</h5>
              <p class="card-text text-truncate">{{ video.v_description }}</p>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-3">
              <small class="text-muted">{{ video.v_auth_fk }}</small>
              <div class="d-flex align-items-center text-muted">
                <span class="me-3 d-flex align-items-center"><i class="bi bi-hand-thumbs-up me-1"></i> {{ video.v_t_jaimes }}</span>
                <span class="d-flex align-items-center"><i class="bi bi-chat-left-text me-1"></i> {{ video.v_t_commentaires }}</span>
              </div></div></div></div></div></div>
  </section>
    <section class="actualites" v-else>
      <h2>Recommendations</h2>
      <h5>Top tag</h5>
      <div class="tags-container mb-4">
        <span v-for="(tag, index) in tagsRecommandes" :key="index" class="badge bg-secondary me-2">{{ tag }}</span>
      </div>
      <div class="row">
        <div v-for="video in videosActualites" :key="video.v_id" class="col-lg-3 col-md-4 col-sm-6 mb-4">
          <div class="card video-card h-100 shadow-sm d-flex flex-column">
            <div class="p-2">
              <template v-for="(tag, index) in getTagsWithLimit(video).displayedTags" :key="index">
                <span :class="'badge me-1 ' + getBadgeClass(tag)">{{ tag }}</span>
              </template>
              <span v-if="getTagsWithLimit(video).remainingTagsCount > 0" class="badge bg-secondary">
                +{{ getTagsWithLimit(video).remainingTagsCount }} tags
              </span>
            </div>
            <div class="position-relative">
              <img :src="`${lien}${video.v_miniature}`" class="card-img-top" :alt="`Miniature de ${video.v_titre}`" style="object-fit: cover; height: 200px; width: 100%;" />
              <button @click="ouvrirLecteurVideo(video.v_id, video.v_titre || video.v_nom, `${lien}${video.v_video}`, video.v_auth_fk, video.v_description, video.v_t_jaimes, video.v_t_vues, video.v_t_commentaires)" 
                class="play-button btn btn-light position-absolute top-50 start-50 translate-middle" style="border-radius: 50%; padding: 0; width: 50px; height: 50px;">
                <img :src="urlImageLecture" class="play-image" style="width: 100%; height: 100%;"/>
              </button>
            </div>
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 class="card-title text-truncate">{{ video.v_titre }}</h5>
                <p class="card-text text-truncate">{{ video.v_description }}</p>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <small class="text-muted">{{ video.v_auth_fk }}</small>
                <div class="d-flex align-items-center text-muted">
                  <span class="me-3 d-flex align-items-center"><i class="bi bi-hand-thumbs-up me-1"></i> {{ video.v_t_jaimes }}</span>
                  <span class="d-flex align-items-center"><i class="bi bi-chat-left-text me-1"></i> {{ video.v_t_commentaires }}</span>
                </div></div></div></div></div></div>
    </section>
  </div>
  <div v-else>
    <VideoPlayer :video-id="videoSelectionneId" :video-title="videoSelectionneTitre" :video-url="videoSelectionneUrl" :v_auth_fk="videoSelectionneAuth" :v_description="videoSelectionneDescription" :v_t_jaimes="videoSelectionneLikes" :v_t_vues="videoSelectionneViews" :v_t_commentaires="videoSelectionneComments" @close= "changevueVideoPlayer"/>
  </div>
</template>

<style scoped>
.homepage { padding: 5px; }
h1 { margin-bottom: 25px; }
h2 { margin-bottom: 15px; font-weight: 300; }
h5 { margin-top: 15px; }
.text-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.text-muted { font-size: 0.8rem; color: #ffffff !important; }
.bi { font-size: 1rem; margin-right: 5px; }
.creator-card, .video-card { border: none; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.3s, box-shadow 0.3s; box-shadow: 0 0 13px 3px rgba(0, 0, 0, 0.21); margin-bottom: 10px; }
.creator-card .card-body { padding: 1px; display: flex; flex-direction: column; align-items: center; }
.video-card:hover, .creator-card:hover { transform: scale(1.02); box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); }
.card-title { font-size: 1.1rem; font-weight: bold; color: #ffffff; text-align: center; }
.card-text { font-size: 0.9rem; color: #ffffff; }
.top-creators .row > div, .tendances .row > div { margin-bottom: 10px; }
.createurs { display: flex; align-items: center; width: 150px; margin: auto; text-align: center; }
.profile-picture { width: 60px; height: 60px; object-fit: cover; border-radius: 12px; }
.SD { margin: 40px; color: white !important; }
@media (max-width: 450px) { .SD { margin: 10px !important; } }
.col-xl-3 { flex: 0 0 auto; width: 200px; }
.tendances, .top-creators { padding: 20px;  background-color: #2a3538;background-image: linear-gradient(160deg, #2d3b3f 0%, #2a3538 100%); border-radius: 12px; box-shadow: 0 0 13px 3px rgb(38 48 51 / 59%);; }
.card {  background-color: #00000000;background-image: linear-gradient(160deg, #00b3e900 0%, #80d0c709 100%); }
.play-button { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: rgba(45, 48, 52, 0.603); border: none; padding: 10px; cursor: pointer; z-index: 10; border-radius: 45px; }
.play-image { width: 50px; height: 50px; display: block; }
.description { margin-top: 10px; font-weight: 200; text-align: center; height: 30px; width: 140px; }
.subscription-button-wrapper { display: flex; justify-content: center; align-items: center; margin-top: 10px; }
</style>
