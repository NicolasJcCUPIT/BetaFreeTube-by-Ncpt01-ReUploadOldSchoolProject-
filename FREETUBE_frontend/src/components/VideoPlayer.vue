<script setup>
import { ref, onMounted, onUnmounted, defineEmits, defineProps } from 'vue';
import { useStore } from 'vuex';
import { ElButton, ElRow, ElCol, ElCard, ElDivider, ElTag, ElInput, ElMessage, ElSelect, ElOption } from 'element-plus';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import axios from 'axios';

// Lecteur vidéo à partir de l'api...
const playlists = ref([]);
const selectedPlaylist = ref('');
const store = useStore();
const baseUri = 'http://localhost:3300/FreeTube/API';
const props = defineProps({
  videoId: { type: Number, required: true },
  videoTitle: { type: String, required: true },
  videoUrl: { type: String, required: true },
  v_auth_fk: { type: String, required: true },
  v_description: { type: String, required: true },
  v_t_jaimes: { type: Number, required: true },
  v_t_vues: { type: Number, required: true },
  v_t_commentaires: { type: Number, required: true }
});
const emits = defineEmits(['close']);
const videoElement = ref(null);
let player = null;
const comments = ref([]);
const showComments = ref(false);
const newComment = ref('');
const token = localStorage.getItem('token') || '';
const localViewCount = ref(props.v_t_vues);
const estAbonne = ref(false);
const messageBoutonAbonnement = ref('S\'abonner');
const videoLiked = ref(false);
const messageBoutonLike = ref('J\'aime');
const historiquePlaylistId =ref('')
const isLoading = ref(false);
console.log('Initialisation des variables');
const verifierAbonnement = async () => {
  console.log('Vérification de l\'abonnement en cours...');
  if (!token) {
    console.log('Pas de token.');
    return;}
  try {
    const response = await axios.post(`${baseUri}/Utilisateurs/Check/Abonnements`, {
      createur_nom: props.v_auth_fk}, {headers: { 'Token': token }});
    console.log('Réponse de la vérification d\'abonnement:', response);
    if (response.status === 200) {
      estAbonne.value = true;
      messageBoutonAbonnement.value = 'Se désabonner';} 
      else {
      estAbonne.value = false;
      messageBoutonAbonnement.value = 'S\'abonner';}} catch (error) {
    console.error('Erreur lors de la vérification de l\'abonnement :', error);}};

const gererAbonnement = async () => {
  console.log('Gestion de l\'abonnement en cours...');
  if (!token) {
    ElMessage.error('Veuillez vous connecter.');
    return;}
  const route = estAbonne.value ? `${baseUri}/Utilisateurs/PlusSuivre` : `${baseUri}/Utilisateurs/Suivre`;
  try {
    const response = await axios.post(route, {
      createur_nom: props.v_auth_fk}, {
      headers: { 'Token': token }});
console.log('Réponse de la gestion d\'abonnement:', response);
    if (response.status === 200) {
      estAbonne.value = !estAbonne.value;
      messageBoutonAbonnement.value = estAbonne.value ? 'Se désabonner' : 'S\'abonner';
      ElMessage.success(response.data.reponse);} 
      else {
      ElMessage.error(response.data.reponse || 'Erreur lors de la gestion de l\'abonnement.');}} catch (error) {
    console.error('Erreur lors de la gestion de l\'abonnement :', error);
    ElMessage.error('Erreur lors de la gestion de l\'abonnement.');}};

const verifierLike = async () => {
  console.log('Vérification du like');
  if (!token) {
    console.log('Pas de token');
    return;}
  try {const response = await axios.post(`${baseUri}/Playlist/Check/Like`, {
      ID_Video: props.videoId}, 
      {headers: { 'Token': token }});
    console.log('Réponse de la vérification de like:', response);
    if (response.status === 201) {
      videoLiked.value = true;
      messageBoutonLike.value = 'Retirer J\'aime';} 
      else if (response.status === 200) {
      videoLiked.value = false;
      messageBoutonLike.value = 'J\'aime';} 
      else {
      videoLiked.value = null;
      messageBoutonLike.value = 'J\'aime';
    }} catch (error) {
    console.error('Erreur lors de la vérification du like :', error);
    videoLiked.value = false;
    messageBoutonLike.value = 'J\'aime';}};

const gererLike = async () => {
  console.log('Gestion du like en cours...');
  if (!token) {
    ElMessage.error('Veuillez vous connecter pour aimer ou annuler le j\'aime.');
    return;}
  const likeActuel = videoLiked.value;
  try {const response = await axios.put(`${baseUri}/Playlist/Like/Video`, 
    {id_videos: props.videoId}, {headers: { 'Token': token }});
    console.log('Réponse de la gestion de like:', response);
    if (response.status === 201) { 
      videoLiked.value = true;
      messageBoutonLike.value = 'Retirer J\'aime';
      ElMessage.success('Vidéo ajoutée aux j\'aimes.');} 
      else if (response.status === 200) { 
      videoLiked.value = false;
      messageBoutonLike.value = 'J\'aime';
      ElMessage.success('Vidéo retirée des j\'aimes.');} 
      else {
      throw new Error(response.data.reponse || 'Erreur lors de l\'action.');}} catch (error) {
    console.error('Erreur lors de l\'action sur la vidéo :', error);
    videoLiked.value = likeActuel;
    messageBoutonLike.value = likeActuel ? 'Retirer J\'aime' : 'J\'aime';
    ElMessage.error('Erreur lors de l\'action.');}};

const ajouterVideoAHistorique = async () => {
  console.log('Ajout de la vidéo à l\'historique en cours...');
  if (!token) {
    console.log('Aucun token, l\'utilisateur doit être connecté pour ajouter la vidéo à l\'historique.');
    return;
  }

  if (!historiquePlaylistId.value) {
    console.log('ID de la playlist Historique introuvable.');
    return;}
  const playlistId = Number(historiquePlaylistId.value);
  console.log('ID de la playlist envoyé:', playlistId);
  console.log('ID de la vidéo envoyé:', props.videoId);
  try {
    const response = await axios.put(`${baseUri}/Playlist/Ajout/Playlist`, {
      id_playlist: playlistId,
      id_videos: props.videoId
    }, {headers: { 'Token': token }});

    console.log('Réponse de l\'ajout à l\'historique:', response);
    if (response.status === 200) {
      console.log('Vidéo ajoutée à la playlist Historique.');} 
      else {
      console.error('Erreur lors de l\'ajout de la vidéo à la playlist Historique :', response.data.reponse);}} 
      catch (error) {
    console.error('Erreur lors de l\'ajout de la vidéo à la playlist Historique :', error);}};
onMounted(async () => {
  console.log('Composant monté. Initialisation des données...');
  await verifierAbonnement();
  await verifierLike();
  if (props.videoUrl) {
    player = videojs(videoElement.value, {
      fluid: true,
      autoplay: false,
      controls: true,
      preload: 'auto',
      sources: [{
        src: props.videoUrl,
        type: 'video/mp4'}]});
    player.on('play', async () => {
      console.log('Lecture vidéo détectée.');
      try {
        console.log('Ajout de vue à la vidéo...');
        await axios.put(`${baseUri}/Videos/Vues/Video`, { 
          id_videos: props.videoId }, {
          headers: { 'Content-Type': 'application/json' }});
        console.log('Vue ajoutée avec succès.');
        await ajouterVideoAHistorique();
      } catch (error) {
        console.error('Erreur lors de l\'ajout de vue à la vidéo ou à l\'historique:', error);}});}

  fetchComments();
  await fetchPlaylists();});

onUnmounted(() => {
  console.log('Démontage du composant, destruction du lecteur vidéo...');
  if (player) {
    player.dispose();}

  localViewCount.value += 1;
  console.log('Compteur de vues incrémenté :', localViewCount.value);});
const toggleComments = () => {
  console.log('Changement de l\'affichage des commentaires...');
  showComments.value = !showComments.value;
  console.log('Affichage des commentaires modifié, maintenant visible :', showComments.value);};
const fetchComments = async () => {
  console.log('Récupération des commentaires en cours...');
  try {
    const response = await axios.post(`${baseUri}/Videos/Commentaires/Liste`, { id_videos: props.videoId });
    console.log('Commentaires récupérés :', response.data);
    comments.value = response.data.data || [];
  } catch (error) {
    console.error('Erreur lors du chargement des commentaires :', error);}};
const submitComment = async () => {
  console.log('Soumission d\'un commentaire en cours...');
  if (!token) {
    ElMessage.error('Veuillez vous connecter pour commenter.');
    console.log('Aucun token disponible, connexion nécessaire pour commenter.');
    return;}

  try {
    console.log('Envoi du commentaire...');
    await axios.post(`${baseUri}/Videos/Commenter`, {
      id_videos: props.videoId,
      commentaire: newComment.value}, {
      headers: { 'Token': token }});
    console.log('Commentaire envoyé');
    newComment.value = '';
    fetchComments();
  } catch (error) {
    console.error('Erreur lors de l\'envoi du commentaire :', error);
    ElMessage.error('Erreur lors de l\'envoi du commentaire.');}};
const fetchPlaylists = async () => {
  console.log('Récupération des playlists en cours...');
  try {
    const response = await axios.post(`${baseUri}/Playlist/Playlists`, {}, {
      headers: { 'Token': token }});
    console.log('Réponse de la récupération des playlists:', response);
    if (response.status === 200 && Array.isArray(response.data.reponse)) {
      playlists.value = response.data.reponse;
      const historiquePlaylist = playlists.value.find(playlist => playlist.nomPlaylist === 'Historique');
      if (historiquePlaylist) {
        historiquePlaylistId.value = historiquePlaylist.idPlaylist;
        console.log('ID de la playlist Historique:', historiquePlaylistId.value);
      } else {
        console.error('Playlist "Historique" introuvable.');}}
         else {
      ElMessage.error('Erreur lors de la récupération des playlists.');}} 
      catch (error) {
    console.error('Erreur lors de la récupération des playlists :', error);
  }
};
const ajouterVideoAPlaylist = async () => {
  console.log('Ajout de la vidéo à la playlist en cours...');
  if (!token) {
    ElMessage.error('Veuillez vous connecter pour ajouter une vidéo à une playlist.');
    return;}

  if (!selectedPlaylist.value) {
    ElMessage.error('Veuillez sélectionner une playlist.');
    return;}

  try {
    const response = await axios.put(`${baseUri}/Playlist/Ajout/Playlist`, {
      id_playlist: selectedPlaylist.value,
      id_videos: props.videoId
    }, {headers: { 'Token': token }});

    console.log('Réponse de l\'ajout à la playlist:', response);
    if (response.status === 200) {
      ElMessage.success('Vidéo ajoutée à la playlist avec succès.');
    } else {
      ElMessage.error(response.data.reponse || 'Erreur lors de l\'ajout de la vidéo à la playlist.');}} catch (error) {
    console.error('Erreur lors de l\'ajout de la vidéo à la playlist :', error);
    ElMessage.error('Erreur lors de l\'ajout de la vidéo à la playlist.'); }};
</script>

<template>
  <div class="video-player-page">
    <el-row class="page-header" justify="end">
      <el-button type="danger" @click="$emit('close')">
        <i class="bi bi-x-lg"></i>
      </el-button>
    </el-row>

    <el-card class="video-content" shadow="hover">
      <el-row justify="center">
        <h2 class="video-title">{{ videoTitle }}</h2>
      </el-row>

      <div class="video-container" v-if="videoUrl">
        <video ref="videoElement"
          class="video-js vjs-default-skin vjs-big-play-centered"
          controls
          preload="auto">
          <source :src="videoUrl" type="video/mp4" />
          <p class="vjs-no-js">
            Pour voir cette vidéo, veuillez activer JavaScript et utiliser un navigateur compatible.
          </p>
        </video>
      </div>
      <el-button @click="() => player.currentTime(player.currentTime() - 5)">- 5</el-button>
      <el-button @click="() => player.currentTime(player.currentTime() + 5)">+ 5</el-button>
      <el-divider></el-divider>

      <el-row class="video-info" justify="space-between">
        <el-col :span="12">
          <el-tag type="info" effect="dark" class="author-tag">{{ v_auth_fk }}</el-tag>
          <p class="text-white">{{ v_description }}</p>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-row class="playlist-selection" justify="center" style="margin-top: 20px;">
            <el-select v-model="selectedPlaylist" placeholder="Sélectionner une playlist" style="width: 300px;">
              <el-option v-for="playlist in playlists" :key="playlist.idPlaylist" :label="playlist.nomPlaylist" :value="playlist.idPlaylist">
                {{ playlist.nomPlaylist }}
              </el-option>
            </el-select>
            <el-button type="primary" @click="ajouterVideoAPlaylist" style="margin-left: 10px;">Ajouter à la Playlist</el-button>
          </el-row>
          <div class="video-stats">  
            <button type="button" class="btn btn-dark btn-sm me-2" @click="gererLike">
              <i :class="videoLiked ? 'bi bi-hand-thumbs-up-fill' : 'bi bi-hand-thumbs-up'"></i> {{ messageBoutonLike }}
            </button>
            <button type="button" class="btn btn-dark btn-sm" @click="toggleComments">
              <i class="bi bi-chat-dots-fill"></i> {{ v_t_commentaires }}
            </button>
            <button type="button" class="btn btn-dark btn-sm me-2" @click="gererAbonnement">
              <i :class="estAbonne ? 'bi bi-person-dash-fill' : 'bi bi-person-plus-fill'"></i> {{ messageBoutonAbonnement }}
            </button>            
            <button type="button" class="btn btn-dark btn-sm me-2">
              <i class="bi bi-eye-fill"></i> {{ localViewCount }}
            </button>
          </div>
          
        </el-col>
      </el-row>

      <div v-if="showComments" class="comments-section">
        <h3>Commentaires</h3>
        <div v-for="comment in comments" :key="comment.id" class="comment">
          <p><strong>{{ comment.c_auth_fk }}</strong>: {{ comment.c_txt }}</p>
        </div>

        <el-input
          type="textarea"
          v-model="newComment"
          placeholder="Ajouter un commentaire..."
          class="new-comment"/>
        <el-button type="primary" @click="submitComment" style="margin-top: 15px;">Commenter</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.video-player-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin-top: -50px;
} .page-header {
  width: 100%;
  padding: 10px 0;
  margin-bottom: 20px;
  text-align: right;
}.video-content {
  width: 94%;
  max-width: 1200px;
  padding: 20px;
  border-radius: 12px;
  background-color: #2b383b;
  box-shadow: 0px 0px 17px -4px rgba(255, 255, 255, 0.18);
  -webkit-box-shadow: 0px 0px 17px -4px rgba(255, 255, 255, 0.18);
  -moz-box-shadow: 0px 0px 17px -4px rgba(255, 255, 255, 0.18);
}.video-title {
  color: #ffffff;
  margin-bottom: 15px;
  font-size: 1.8em;
  text-align: center;
  width: 100%;
}.video-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #212529;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}.video-js {
  width: 100%;
  height: auto;
}.video-info {
  margin-top: 15px;
  color: #ffffff;
  text-align: left;
  width: 100%;
}.video-stats {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 10px;
}.btn-dark {
  font-size: 1em;
  margin-right: 10px;
  border-radius: 5px;
  color: #ffffff;
  background-color: transparent;
  border: 1px solid #ffffff;
  transition: color 0.3s, background-color 0.3s;
}.btn-dark:hover {
  background-color: #ffffff;
  color: #000000;
}.bi {
  margin-right: 5px;
  color: #ffffff;
  transition: color 0.3s;
}.btn-dark:hover .bi {
  color: #000000;
}.comments-section {
  margin-top: 20px;
  color: #ffffff;
  font-weight: 300;
}.comment {
  margin-bottom: 10px;
}.new-comment {
  margin-top: 10px;
  width: 100%;
}.author-tag {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
}
</style>
