<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer.vue';
import { ElMessage } from 'element-plus';

// Page d'administration de playlists
const listesDeLecture = ref([]);
const nouveauNomPlaylist = ref('');
const afficherModal = ref(false);
const videoSelectionneId = ref(null);
const videoSelectionneTitre = ref("");
const videoSelectionneUrl = ref("");
const videoSelectionneAuth = ref("");
const videoSelectionneDescription = ref("");
const videoSelectionneLikes = ref(0);
const videoSelectionneComments = ref(0);
const afficherLecteurVideo = ref(false);
const apiUrl = 'http://localhost:3300/FreeTube/API';
const lien = "http://localhost:3300/";


const recupererListesDeLecture = async () => {
  try {
    const token = localStorage.getItem('token') || '';
    const response = await axios.post(`${apiUrl}/Playlist/Playlists`, {}, {
      headers: { 'Token': token }});

    listesDeLecture.value = response.data.reponse.filter(playlist => playlist.nomPlaylist !== 'Historique')
      .map(playlist => ({
        id: playlist.idPlaylist,
        nom: playlist.nomPlaylist,
        videosList: playlist.videosList,
        afficherVideos: false}));} catch (error) {
    console.error('Erreur lors de la récupération des playlists :', error);
    ElMessage.error('Erreur lors de la récupération des playlists :', error);
  }
};

const creerPlaylist = async () => {
  if (!nouveauNomPlaylist.value.trim()) {
    ElMessage.sucess('Veuillez entrer un nom pour la nouvelle playlist.');
    return;}
  try {
    const token = localStorage.getItem('token') || '';
    const formData = new FormData();
    formData.append('playlist_nom', nouveauNomPlaylist.value);
    await axios.post(`${apiUrl}/Playlist/Cree/Playlist`, formData, {
      headers: {
        'Token': token,
        'Content-Type': 'multipart/form-data'
      }
    });
    nouveauNomPlaylist.value = '';
    afficherModal.value = false;
    await recupererListesDeLecture();
    ElMessage.success('Votre Playlist a été créée.');
  } catch (error) {
    console.error('Erreur lors de la création de la playlist :', error);
  }
};

const supprimerPlaylist = async (playlistId) => {
  try {
    const token = localStorage.getItem('token') || '';
    await axios.delete(`${apiUrl}/Playlist/Supp/Playlist`, {
      headers: { 'Token': token },
      data: { playlist_ID: playlistId }
    });
    await recupererListesDeLecture();
    ElMessage.sucess('Playlist supprimé.');
  } catch (error) {
    console.error('Erreur lors de la suppression de la playlist :', error);
  }
};

const basculerAffichageVideos = (playlistId) => {
  const playlist = listesDeLecture.value.find(p => p.id === playlistId);
  if (playlist) {
    playlist.afficherVideos = !playlist.afficherVideos;
  }
};

const ouvrirLecteurVideo = (video) => {
  videoSelectionneId.value = video.v_id;
  videoSelectionneTitre.value = video.v_titre;
  videoSelectionneUrl.value = `${lien}${video.v_video}`;
  videoSelectionneAuth.value = video.v_auth_fk;
  videoSelectionneDescription.value = video.v_description;
  videoSelectionneLikes.value = video.v_t_jaimes;
  videoSelectionneComments.value = video.v_t_commentaires;
  afficherLecteurVideo.value = true;
};

const fermerLecteurVideo = () => {
  afficherLecteurVideo.value = false;
};

onMounted(async () => {
  await recupererListesDeLecture();
});
</script>


<template>
  <div v-if="!afficherLecteurVideo" class="container mt-5">
    <h1 class="text-center mb-4">Mes Playlist</h1>
    
    <div class="d-flex justify-content-center mb-4">
      <button @click="afficherModal = true" class="btn btn-success">Créer Playlist</button>
    </div>

    <div v-if="afficherModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Créer une nouvelle Playlist</h2>
        <input v-model="nouveauNomPlaylist" type="text" placeholder="Nom de la nouvelle playlist" class="form-control" />
        <div class="mt-3 d-flex justify-content-center">
          <button @click="creerPlaylist" class="btn btn-primary">Créer</button>
          <button @click="afficherModal = false" class="btn btn-secondary ml-2">Annuler</button>
        </div>
      </div>
    </div>

    <div v-if="listesDeLecture.length > 0">
      <div v-for="playlist in listesDeLecture" :key="playlist.id" class="mb-5">
        <h2 class="mb-3 d-flex align-items-center">
          <button @click="basculerAffichageVideos(playlist.id)" class="btn btn-dark flex-grow-1" style="text-align: justify;">
            <h5 style="font-weight: 300;margin-left: 10px;">{{ playlist.nom }}</h5> 
            <span v-if="playlist.afficherVideos">▲</span><span v-else>▼</span>
          </button>
          <button v-if="playlist.nom !== 'jaime' && playlist.nom !== 'À consulter plus tard'" @click="supprimerPlaylist(playlist.id)" class="btn btn-danger ml-2">Supprimer</button>
        </h2>
        
        <div v-if="playlist.afficherVideos" class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          <div v-for="video in playlist.videosList" :key="video.v_id" class="col">
            <div class="card custom-card ">
              <div class="card-body d-flex flex-column justify-content-between">
               <div style="height: 80px;">
                <h5 class="card-title">{{ video.v_titre }}</h5>
                <p class="card-text text-truncate">{{ video.v_description }}</p>
              </div>
            </div>
              <div class="card-footer d-flex justify-content-between align-items-center mt-3">
                <small class="text-muted">{{ video.v_auth_fk }}</small>
                <div class="d-flex align-items-center">
                  <span class="me-3 d-flex align-items-center like-count">
                    <i class="bi bi-hand-thumbs-up me-1"></i> {{ video.v_t_jaimes }}
                  </span>
                  <span class="d-flex align-items-center comment-count">
                    <i class="bi bi-chat-left-text me-1"></i> {{ video.v_t_commentaires }}
                  </span>
                </div>
              </div>
              <button @click="ouvrirLecteurVideo(video)" class="btn btn-dark mt-3">Lire la vidéo</button>
            </div>
          </div>
          </div>
          
        </div>
      </div>
    

    <div v-else>
      <p class="text-center">Aucune liste de lecture trouvée.</p>
    </div>
  </div>

  <div v-if="afficherLecteurVideo">
    <VideoPlayer 
      :video-id="videoSelectionneId" 
      :video-title="videoSelectionneTitre" 
      :video-url="videoSelectionneUrl" 
      :v_auth_fk="videoSelectionneAuth" 
      :v_description="videoSelectionneDescription" 
      :v_t_jaimes="videoSelectionneLikes" 
      :v_t_commentaires="videoSelectionneComments"
      @close="fermerLecteurVideo" />
  </div>
</template>


<style scoped>
.container {
  max-width: 80%;
  margin: auto;
  z-index: 1;
  padding: 20px;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.video-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 0 13px 3px rgba(0, 0, 0, 0.21);
  background-color: #212529;
  border-radius: 8px;
  padding: 10px;
}

.video-card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.card-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10px;
}

.card-text {
  font-size: 0.9rem;
  color: #ffffff;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-muted {
  font-size: 0.8rem;
  color: #ffffff !important;
}

.bi {
  font-size: 1rem;
  margin-right: 5px;
}

.ml-2 {
  margin-left: 10px;
}

.mt-3 {
  margin-top: 10px;
}

.btn {
  margin-right: 10px;
  transition: background-color 0.3s ease;
    HEIGHT: 65PX!important

}

.btn:hover {
  background-color: #6c757d;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #202528;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
  z-index: 1010;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card{
     width: 250px!important;
    height: 250px!important;
    --bs-card-color: white;
    --bs-card-bg: #2c373a;
    --bs-card-img-overlay-padding: 1rem;
    --bs-card-group-margin: 0.75rem;
    color: #ffffff;
    border: none;
}
input::placeholder, textarea::placeholder {
  color: rgba(255, 255, 255, 0.7); 
  opacity: 1;
}

.btn-dark {
    --bs-btn-color: #fff;
    --bs-btn-bg: #21252973;
    --bs-btn-border-color: #f1f1f100;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #42464947;

}

</style>
