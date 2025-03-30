<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer.vue';
import EditVideoModal from '../components/ModifierVideo.vue';

const urlImageLecture = new URL('/play.png', import.meta.url).href;

const videos = ref([]);
const pageActuelle = ref(1);
const elementsParPage = 8;
const videoSelectionneeId = ref(null);
const videoSelectionneeTitre = ref("");
const videoSelectionneeUrl = ref("");
const messageSucces = ref("");
const chargement = ref(true);
const afficherLecteurVideo = ref(false);
const afficherModalEdition = ref(false);
const videoAEditer = ref(null);

const videosPaginees = computed(() => {
  const debut = (pageActuelle.value - 1) * elementsParPage;
  return videos.value.slice(debut, debut + elementsParPage);
});

const nombreTotalPages = computed(() => Math.ceil(videos.value.length / elementsParPage));

const recupererVideos = async () => {
  const token = localStorage.getItem('token') || '';
  try {
    const { data } = await axios.post('http://localhost:3300/FreeTube/API/Videos/Mes/videos', {}, {
      headers: { 'Token': token }
    });

    console.log('Fetched Videos:', data.reponse);

    videos.value = data.reponse.map(video => ({
      ...video,
      v_miniature: video.v_miniature ? `http://localhost:3300/${video.v_miniature}` : '',
      v_video: video.v_video ? `http://localhost:3300/${video.v_video}` : ''
    }));
  } catch (error) {
    console.error("Oups, une erreur est survenue lors de la récupération des vidéos:", error);
  } finally {
    chargement.value = false;
  }
};

const supprimerVideo = async (videoId, videoTitre) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer la vidéo "${videoTitre}" ?`)) {
    const token = localStorage.getItem('token') || '';
    try {
      const response = await axios.delete('http://localhost:3300/FreeTube/API/Videos/Supprimer/Video', {
        headers: { 'Token': token },
        data: { id_videos: videoId }
      });

      if (response.status === 200) {
        messageSucces.value = "La vidéo a été supprimée avec succès.";
        recupererVideos();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la vidéo:", error);
    }
  }
};

const ouvrirLecteurVideo = (videoId, videoTitre, videoUrl) => {
  videoSelectionneeId.value = videoId;
  videoSelectionneeTitre.value = videoTitre;
  videoSelectionneeUrl.value = videoUrl;
  afficherLecteurVideo.value = true;
};


const editerVideo = (video) => {
  console.log('Informations envoyées à EditVideoModal:', {
    v_DATE: video.v_DATE,
    v_auth_fk: video.v_auth_fk,
    v_categorie_fk: video.v_categorie_fk,
    v_description: video.v_description,
    v_id: video.v_id,
    v_majeur: video.v_majeur,
    v_miniature: video.v_miniature,
    v_statut: video.v_statut,
    v_t_commentaires: video.v_t_commentaires,
    v_t_jaimes: video.v_t_jaimes,
    v_t_vues: video.v_t_vues,
    v_tag1: video.v_tag1,
    v_tag2: video.v_tag2,
    v_tag3: video.v_tag3,
    v_tag4: video.v_tag4,
    v_tag5: video.v_tag5,
    v_tag6: video.v_tag6,
    v_tag7: video.v_tag7,
    v_tag8: video.v_tag8,
    v_tag9: video.v_tag9,
    v_tag10: video.v_tag10,
    v_titre: video.v_titre,
    v_video: video.v_video
  });

  videoAEditer.value = video;
  videoSelectionneeId.value = video.v_id;
  afficherModalEdition.value = true;
};


const fermerModalEdition = () => {
  afficherModalEdition.value = false;
  videoAEditer.value = null;
  videoSelectionneeId.value = null;
};

const surMiseAJourSucces = () => {
  messageSucces.value = "Vidéo modifiée avec succès.";
  recupererVideos();
  fermerModalEdition();
};

onMounted(() => {
  recupererVideos();
});
</script>

<template>
  <div class="container mt-5 cont" v-if="!afficherModalEdition">
    <h1>Mes Vidéos</h1>
    <div v-if="messageSucces" class="alert alert-success" role="alert">{{ messageSucces }}</div>
    <div v-if="chargement" class="alert alert-dark" role="alert">
      Chargement des vidéos...
    </div>

    <div v-if="!chargement && videos.length === 0" class="alert alert-info" role="alert">
      Vous n'avez pas encore uploadé de vidéo. Pourquoi ne pas commencer dès maintenant ? 😊
    </div>

    <div v-if="!chargement && videos.length > 0">
      <div class="row g-3" style="display: flex; flex-wrap: wrap;">
        <div class="col-12 col-md-6 col-lg-3" v-for="video in videosPaginees" :key="video.v_id">
          <div class="card mb-4 shadow-sm">
            <div style="position: relative;">
              <img :src="video.v_miniature" class="card-img-top" alt="Miniature de la vidéo">
              <button @click="ouvrirLecteurVideo(video.v_id, video.v_titre || video.v_nom, video.v_video)" class="play-button">
                <img :src="urlImageLecture" class="play-image"/>
              </button>
            </div>
            <div class="card-body d-flex flex-column">
              <div style="height: 60px;">
              <h5 class="card-title">{{ video.v_titre || video.v_nom }}</h5>
              </div>
              <div style="height: 60px;">
              <p class="card-text">{{ video.v_description }}</p>
              </div>
              <div class="mt-auto">
                <button class="btn btn-secondary w-100 mb-2" @click="editerVideo(video)">Éditer</button>
                <button class="btn btn-danger w-100" @click="supprimerVideo(video.v_id, video.v_titre || video.v_nom)">Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav v-if="nombreTotalPages > 1" aria-label="Page navigation">
        <ul class="pagination justify-content-center mt-4">
          <li :class="['page-item', { disabled: pageActuelle === 1 }]">
            <a class="page-link" href="#" @click.prevent="changerPage(pageActuelle - 1)">Précédent</a>
          </li>
          <li v-for="page in nombreTotalPages" :key="page" :class="['page-item', { active: page === pageActuelle }]">
            <a class="page-link" href="#" @click.prevent="changerPage(page)">{{ page }}</a>
          </li>
          <li :class="['page-item', { disabled: pageActuelle === nombreTotalPages }]">
            <a class="page-link" href="#" @click.prevent="changerPage(pageActuelle + 1)">Suivant</a>
          </li>
        </ul>
      </nav>
    </div>

    <VideoPlayer 
      v-if="afficherLecteurVideo" 
      :video-id="videoSelectionneeId" 
      :video-title="videoSelectionneeTitre" 
      :video-url="videoSelectionneeUrl" 
      @close="afficherLecteurVideo = false" />
  </div>

  <EditVideoModal
    v-if="afficherModalEdition"
    :video="videoAEditer"
    :videoId="videoSelectionneeId"
    @close="fermerModalEdition"
    @update-success="surMiseAJourSucces" />
</template>

<style scoped>
.btn-info {
  --bs-btn-color: #fff;
  --bs-btn-bg: #0dcaf04f;
}
.btn-secondary {
  --bs-btn-color: #fff;
  --bs-btn-bg: #6c757d36;
}
.btn-danger {
  --bs-btn-color: #fff;
  --bs-btn-bg: #dc35456e;
}
.card {
  color: #ffffff!important;
  background-color: #21252921 !important;
  border: none!important;
  --bs-card-border-radius: 12px!important;
}
.card-img-top {
  object-fit: cover;
  height: 180px;
  border-radius: 12px;
}
.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(45, 48, 52, 0.75);
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 10;
  border-radius: 45px;
}
.play-image {
  width: 50px;
  height: 50px;
  display: block;
}
.modal {
  --bs-modal-bg: #212529bf !important;
  --bs-modal-footer-bg: #00000000 !important;
  backdrop-filter: blur(9px);
}
.modal.d-block {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  width: 100%;
  height: 100%;
  overflow: hidden;
  outline: 0;
}
.modal-dialog {
  margin: auto;
}
.modal-content {
  color: #ffffff;
  background-color: #22262a00;
  border-radius: .3rem;
  outline: 0;
}
.alert {
  margin-top: 20px;
}
.pagination {
  --bs-pagination-padding-x: 0.75rem;
  --bs-pagination-padding-y: 0.375rem;
  --bs-pagination-font-size: 1rem;
  --bs-pagination-color: #ffffff;
  --bs-pagination-bg: #fff0;
  --bs-pagination-border-width: var(--bs-border-width);
  --bs-pagination-border-color: #00000000;
  --bs-pagination-border-radius: var(--bs-border-radius);
  --bs-pagination-hover-color: #0dcaf0;
  --bs-pagination-hover-bg: #00000000;
  --bs-pagination-hover-border-color: #00000000;
  --bs-pagination-focus-color: #e76d23;
  --bs-pagination-focus-bg: #ffffff;
  --bs-pagination-focus-box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  --bs-pagination-active-color: #fff;
  --bs-pagination-active-bg: #e76d23;
  --bs-pagination-active-border-color: #e76d23;
  --bs-pagination-disabled-color: var(--bs-secondary-color);
  --bs-pagination-disabled-bg: var(--bs-secondary-bg);
  --bs-pagination-disabled-border-color: var(--bs-border-color);
  display: flex;
  padding-left: 0;
  list-style: none;
}
.page-item.active .page-link {
  background-color: #ffffff12!important;
  border-color: #00000000!important;
  color: #ffffff!important;
  border-radius: 40%!important;
}
.page-link.disabled, .disabled > .page-link {
  pointer-events: none!important;
  background-color: #00000000!important;
  border-color: #00000000!important;
  color: white!important;
}
.page-item.disabled .page-link {
  pointer-events: none;
}
.page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}
.card-custom {
  flex: 0 0 25%;
  max-width: 25%;
  padding: 15px;
  box-sizing: border-box;
}
.card-body .btn {
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
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
