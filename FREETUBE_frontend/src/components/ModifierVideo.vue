
<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import { ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElDatePicker } from 'element-plus';

const props = defineProps(['video', 'videoId']);
const emit = defineEmits(['close', 'update-success']);

const videoData = ref(null);
const tagsString = ref('');
const token = localStorage.getItem('token');
const currentMiniature = ref('');
const newMiniature = ref(null);
const newMiniaturePreview = ref('');

// Form éditer une vidoe.
watch(() => props.video, (newVideo) => {
  if (newVideo) {
    videoData.value = {
      id_videos: Number(props.videoId),
      titre: newVideo.v_titre,
      description: newVideo.v_description,
      visibilite: newVideo.v_statut === 1 ? 'oui' : 'non',
      majeur: newVideo.v_majeur === 0 ? 'oui' : 'non',
      date: newVideo.v_date,
      tag1: newVideo.v_tag1,
      tag2: newVideo.v_tag2,
      tag3: newVideo.v_tag3,
      tag4: newVideo.v_tag4,
      tag5: newVideo.v_tag5,
      tag6: newVideo.v_tag6,
      tag7: newVideo.v_tag7,
      tag8: newVideo.v_tag8,
      tag9: newVideo.v_tag9,
      tag10: newVideo.v_tag10
    };

    currentMiniature.value = newVideo.v_miniature;

    tagsString.value = [
      newVideo.v_tag1, newVideo.v_tag2, newVideo.v_tag3, newVideo.v_tag4, newVideo.v_tag5,
      newVideo.v_tag6, newVideo.v_tag7, newVideo.v_tag8, newVideo.v_tag9, newVideo.v_tag10
    ].filter(tag => tag).join(', ');
  }
}, { immediate: true });

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    newMiniature.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      newMiniaturePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};


const submitChanges = async () => {
  const tagsArray = tagsString.value.split(',').map(tag => tag.trim()).filter(tag => tag);

  for (let i = 0; i < 10; i++) {
    videoData.value[`tag${i + 1}`] = tagsArray[i] || '';
  }

  // Vérifier et formater la date avant d'envoyer la requête / format api AAAA-MM-DD...
  if (videoData.value.date) {
    const date = new Date(videoData.value.date);
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
    videoData.value.date = formattedDate;
  }

  const requestData = new FormData();
  Object.keys(videoData.value).forEach(key => {
    requestData.append(key, videoData.value[key]);
  });

  if (newMiniature.value) {
    requestData.append('miniature', newMiniature.value);
  }

  try {
    const response = await axios.put('http://localhost:3300/FreeTube/API/Videos/change/Video', requestData, {
      headers: { 'Token': token, 'Content-Type': 'multipart/form-data' }
    });

    if (response.status === 200) {
      alert('Vidéo mise à jour avec succès !');
      emit('update-success');
    } else {
      alert('Erreur lors de la mise à jour de la vidéo.');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la vidéo:', error);
  }
};


const resetForm = () => {
  videoData.value = {
    id_videos: Number(props.videoId),
    titre: '',
    description: '',
    visibilite: '',
    majeur: '',
    date: '',
    tag1: '',
    tag2: '',
    tag3: '',
    tag4: '',
    tag5: '',
    tag6: '',
    tag7: '',
    tag8: '',
    tag9: '',
    tag10: ''
  };
  tagsString.value = '';
  newMiniature.value = null;
  newMiniaturePreview.value = '';
};

const cancelEdit = () => {
  resetForm();
  emit('close');
};
</script>
<template>
  <div v-if="videoData" class="conteneur-edit-video">
    <div class="edit-video-container">
      <h1 class="en-tete-edit">Modifier la Vidéo</h1>
      <el-form @submit.prevent="submitChanges" class="contenu-edit" :model="videoData">
        
          <!-- Titre -->
          <el-form-item prop="titre">
          <label class="form-label">Titre</label>
          <el-input
            type="text"
            v-model="videoData.titre"
            placeholder="Entrez le titre de la vidéo"
            required
            class="form-control"
          ></el-input>
          <p style="font-size:11px;margin-top: -10px;margin-left:15px;font-weight:300;">Minimum 3 caractères</p>
        </el-form-item>

        <!-- Miniature -->
        <el-form-item prop="miniature">
          <label class="form-label"></label>
          <div class="cadre-miniature">
            <img :src="newMiniaturePreview || currentMiniature" alt="Miniature" class="miniature-preview"/>
          </div>
          </el-form-item>
      
          <div>
          <input type="file" @change="handleFileChange" accept="image/*" />
          </div>
      

        <!-- Description -->
        <el-form-item prop="description">
          <label class="form-label">Description</label>
          <el-input
            type="textarea"
            v-model="videoData.description"
            placeholder="Décrivez la vidéo"
            required
            class="form-control"
          ></el-input>
          <p style="font-size:11px;margin-top: -10px;margin-left:15px;font-weight:300;">Minimum 3 caractères</p>
        </el-form-item>

        <!-- Visibilité -->
        <el-form-item prop="visibilite">
          <label class="form-label">Visibilité</label>
          <el-select
            v-model="videoData.visibilite"
            placeholder="Sélectionnez la visibilité"
            required
            class="form-control"
          >
            <el-option label="Publique" value="oui"></el-option>
            <el-option label="Privée" value="non"></el-option>
          </el-select>
        </el-form-item>

        <!-- Réservé aux plus de 18 ans -->
        <el-form-item prop="majeur">
          <label class="form-label">Réservé aux plus de 18 ans</label>
          <el-select
            v-model="videoData.majeur"
            placeholder="Sélectionnez une option"
            required
            class="form-control"
          >
            <el-option label="Oui" value="oui"></el-option>
            <el-option label="Non" value="non"></el-option>
          </el-select>
        </el-form-item>

        <!-- Date -->
        <el-form-item prop="date">
          <label class="form-label">Date de publication</label>
          <el-date-picker
            v-model="videoData.date"
            type="datetime"
            placeholder="Sélectionnez la date et l'heure"
            format="YYYY-MM-DD HH:mm:ss"
            required
            class="form-control"
          ></el-date-picker>
        </el-form-item>

        <!-- Tags -->
        <el-form-item prop="tags">
          <label class="form-label">Tags (séparés par des virgules)</label>
          <el-input
            type="text"
            v-model="tagsString"
            placeholder="Ex: #fun, #education"
            class="form-control"
          ></el-input>
        </el-form-item>

        <!-- Boutons -->
        <div class="button-group">
          <el-button type="primary" native-type="submit" class="btn-lg">Enregistrer les modifications</el-button>
          <el-button @click="cancelEdit" type="danger" class="btn-danger">Annuler</el-button>
        </div>
      </el-form>
    </div>
  </div>
  <div v-else>
    <p>Chargement des détails de la vidéo...</p>
  </div>
</template>


<style scoped>
.miniature-preview {
  max-width: 200px;
  border-radius: 12px; 
  display: block;
  margin: 0 auto; 
}.cadre-miniature {
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  margin-bottom: 10px; 
  text-align: center; 
}.conteneur-edit-video {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background-color: #00000014;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: #ffffff;
}.en-tete-edit {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #ffffff;
  text-align: center;
}.edit-video-container {
  padding: 20px;
  border-radius: 8px;
  background-color: #00000000;
}.form-control {
  display: block;
  width: 100%;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  transition: all 0.3s ease;
}.form-control:focus,
.form-control:hover {
  border-color: #4a90e2;
  background-color: rgba(255, 255, 255, 0.15);
}.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #ffffff;
}.button-group {
  display: flex;
  justify-content: space-between;
}.btn-lg {
  font-size: 1rem;
  margin-top: 1rem;
  background-color: #4a90e2;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 5px;
}.btn-lg:hover {
  background-color: #357abd;
}.btn-danger {
  margin-top: 20px;
  background-color: #e74c3c;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 5px;
}.btn-danger:hover {
  background-color: #c0392b;
}.el-form-item__content {
  line-height: 0px; 
}.el-textarea__inner {
  background-color: #ffffff00!important;
  color: #ffffff!important;
}
</style>
