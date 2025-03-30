<script setup>
import { ref } from 'vue'
import { ElSelect, ElOption, ElButton, ElInput, ElDatePicker } from 'element-plus'
import axios from 'axios'
import 'element-plus/dist/index.css'
import { useRouter } from 'vue-router'

// Upload vidéos pour sa chaîne freetube
const routeur = useRouter()
const titre = ref('')
const description = ref('')
let miniature = null
let video = null
const urlMiniature = ref('')
const urlVideo = ref('')
const progressionTelechargement = ref(0)
const categories = ref([
  'animations', 'animaux', 'astrologie', 'automobile', 'blogs',
  'cinema', 'commerce', 'critiques', 'divertissement', 'education',
  'enfants', 'freetube', 'humour', 'informatique', 'jeux', 'journalisme',
  'ludique', 'meditation', 'musique', 'politique', 'sciences', 'tv', 'voyages'
])
const categorieSelectionnee = ref('')
const date = ref('')
const tags = ref([{ id: 1, value: '' }])

const visibilite = ref(null)
const restrictionAge = ref(null)

const gererTelechargementMiniature = (event) => {
  miniature = event.target.files[0]
  if (miniature) {
    urlMiniature.value = URL.createObjectURL(miniature)
  }
}

const gererTelechargementVideo = (event) => {
  video = event.target.files[0]
  if (video) {
    urlVideo.value = URL.createObjectURL(video)
  }
}

const ajouterTag = () => {
  if (tags.value.length < 10) {
    tags.value.push({ id: tags.value.length + 1, value: '#'+'' })
  }
}

const supprimerTag = (index) => {
  if (tags.value.length > 1) {
    tags.value.splice(index, 1)
  }
}

const formaterDatePourAPI = (dateString) => {
  const d = new Date(dateString)
  const pad = (num) => (num < 10 ? '0' + num : num)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const telechargerVideo = async () => {
  if (!titre.value.trim() || !description.value.trim() || !categorieSelectionnee.value || !date.value || !video || visibilite.value === null || restrictionAge.value === null) {
    alert('Veuillez remplir tous les champs obligatoires.')
    return
  }

  const tagsNonVides = tags.value.filter(tag => tag.value.trim() !== '')
  if (tagsNonVides.length === 0) {
    alert('Au moins un tag est requis')
    return
  }

  const formData = new FormData()
  formData.append('titre', titre.value)
  formData.append('description', description.value)
  formData.append('miniature', miniature)
  formData.append('video', video)
  formData.append('categorie', categorieSelectionnee.value)
  formData.append('date', formaterDatePourAPI(date.value))
  formData.append('visibilite', visibilite.value === '1' ? 'oui' : 'non')
  formData.append('majeur', restrictionAge.value === '1' ? 'non' : 'oui')
  tagsNonVides.forEach((tag, index) => formData.append(`tag${index + 1}`, tag.value))

  const token = localStorage.getItem('token') || ''
  try {
    const response = await axios.post('http://localhost:3300/FreeTube/API/Videos/Creations', formData, {
      headers: { 'Token': token },
      onUploadProgress: progressEvent => {
        progressionTelechargement.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })

    if (response.status === 200) {
      alert('Vidéo uploadée avec succès')
      reinitialiserFormulaire()
      routeur.push('/mes-videos')
    } else {
      alert('Erreur lors de l\'upload de la vidéo : ' + response.data.reponse)
    }
  } catch (error) {
    alert('Erreur lors de l\'upload de la vidéo')
    console.error(error)
  }
}

const reinitialiserFormulaire = () => {
  titre.value = ''
  description.value = ''
  miniature = null
  video = null
  categorieSelectionnee.value = ''
  date.value = ''
  tags.value = [{ id: 1, value: '#'+'' }]
  visibilite.value = null
  restrictionAge.value = null
  progressionTelechargement.value = 0
  urlMiniature.value = ''
  urlVideo.value = ''
}
</script>

<template>
  <div class="conteneur-upload mt-5">
    <div class="en-tete-upload">
      <h1>Uploader une Vidéo</h1>
      <p>Partagez vos créations avec le monde.</p>
    </div>
    <form @submit.prevent="telechargerVideo" enctype="multipart/form-data" class="contenu-upload">
      <div class="section-upload">
        <label for="video" class="label-video">Sélectionner une vidéo</label>
        <input type="file" class="form-control input-video" id="video" @change="gererTelechargementVideo" accept="video/*" required>
        <small class="note-format">Formats acceptés : MP4, AVI, WEBM (Max 128 Go)</small>
        <div v-if="urlVideo" class="video-preview mb-3">
          <video controls :src="urlVideo" class="video-player"></video>
        </div>
      </div>
      <div v-if="progressionTelechargement > 0" class="conteneur-progression">
        <div class="barre-progression" :style="{ width: progressionTelechargement + '%' }">{{ progressionTelechargement }}%</div>
      </div>
      <div class="section-details">
        <h5 class="titre-section">Détails de la Vidéo</h5>
        <div class="mb-3">
          <label for="title" class="label-formulaire">Titre</label>
          <ElInput type="text" class="form-control" id="title" v-model="titre" placeholder="Entrez le titre de votre vidéo" required></ElInput>
          <p style="font-size:10px;margin-top: -20px;margin-left:15px;font-weight:300;">Minimum 3 caractères</p>
        </div>
   
        <div class="mb-3">
          <label for="description" class="label-formulaire">Description</label>
          <ElInput type="textarea" class="form-control" id="description" v-model="description" rows="4" placeholder="Décrivez votre vidéo" required></ElInput>
        </div>
        <p style="font-size:10px;margin-top: -20px;margin-left:15px;font-weight:300;">Minimum 3 caractères</p>
        <div class="mb-3">
          <label for="thumbnail" class="label-formulaire">Miniature</label>
          <input type="file" class="form-control" id="thumbnail" @change="gererTelechargementMiniature" accept="image/*" required>
          <small class="note-format">Formats acceptés : JPG, PNG, WEBP</small>
          <div v-if="urlMiniature" class="thumbnail-preview mb-3">
            <img :src="urlMiniature" alt="Prévisualisation de la miniature" class="img-thumbnail">
          </div>
        </div>
        <div class="mb-3">
          <label for="category" class="label-formulaire">Catégorie</label>
          <ElSelect v-model="categorieSelectionnee" placeholder="Sélectionnez une catégorie" class="full-width">
            <ElOption
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category">
            </ElOption>
          </ElSelect>
        </div>
        <div class="mb-3">
          <el-form-item prop="date">
            <label class="form-label">Date de publication</label>
            <el-date-picker
              v-model="date"
              type="datetime"
              placeholder="Sélectionnez la date et l'heure"
              format="YYYY-MM-DD HH:mm:ss"
              required
              class="form-control"
            ></el-date-picker>
          </el-form-item>
        </div>
        <div class="mb-3">
          <label for="visibility" class="label-formulaire">Visibilité</label>
          <ElSelect v-model="visibilite" placeholder="Sélectionnez la visibilité" class="full-width">
            <ElOption label="Privée" value="0"></ElOption>
            <ElOption label="Publique" value="1"></ElOption>
          </ElSelect>
        </div>
       
        <div class="mb-3">
          <label for="ageRestriction" class="label-formulaire">Réservée aux plus de 18 ans</label>
          <ElSelect v-model="restrictionAge" placeholder="Sélectionnez l'accès" class="full-width">
            <ElOption label="Oui" value="0"></ElOption>
            <ElOption label="Non" value="1"></ElOption>
          </ElSelect>
        </div>
        <div class="mb-3">
          <label for="tags" class="label-formulaire">Tags</label>
          <div v-for="(tag, index) in tags" :key="tag.id" class="input-groupe">
            <ElInput type="text" class="form-control" v-model="tag.value" :placeholder="`Tag ${index + 1}`"></ElInput>
            <ElButton type="danger" @click="supprimerTag(index)" v-if="tags.length > 1" icon="el-icon-delete"></ElButton>
          </div>
          <ElButton type="primary" @click="ajouterTag" v-if="tags.length < 10">Ajouter un tag</ElButton>
        </div>
      </div>
      <div class="actions-upload">
        <ElButton type="primary" size="large" native-type="submit" class="btn-lg" style=" margin-bottom: 60PX;">Publier</ElButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.thumbnail-preview img, .video-preview video {
  width: 100%;
  height: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 1rem;
}.el-select .el-input .el-input__inner {
  background-color: #212529 !important; 
  color: #ffffff !important; 
}.el-select-dropdown .el-scrollbar .el-select-dropdown__wrap .el-scrollbar__view .el-select-dropdown__item {
  background-color: #212529 !important; 
  color: #ffffff !important; 
}.el-select-dropdown .el-scrollbar .el-select-dropdown__wrap .el-scrollbar__view .el-select-dropdown__item:hover {
  background-color: #1b1e21 !important; 
}.conteneur-upload {
  max-width: 700px;
  margin: 0 auto;
  padding: 30px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 12px;
  height: 150px;
  border-radius: 18px;
}.en-tete-upload h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #ffffff;
  text-align: center;
}.en-tete-upload p {
  font-size: 1.25rem;
  color: #f1f1f1;
  margin-bottom: 2rem;
  text-align: center;
}.contenu-upload {
  padding: 20px;
  border-radius: 8px;
}.section-upload {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
  border: 2px dashed rgba(255, 255, 255, 0.5);
}.label-video {
  font-size: 1.5rem;
  font-weight: 500;
  color: #ffffff;
}.input-video {
  margin-top: 1.5rem;
  color: #ffffff;
}.note-format {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  display: block;
  margin-top: 0.5rem;
}.conteneur-progression {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
  height: 23px;
}.barre-progression {
  background-color: #28a745;
  height: 100%;
  transition: width 0.4s ease;
}.section-details {
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: 20px;
  margin-top: 20px;
}.titre-section {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #ffffff;
}.input-groupe {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}.actions-upload {
  text-align: center;
  margin-top: 2rem;
}.btn-lg {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: #ffffff;
  font-size: 1rem;
  padding: 10px 20px;
  color: #ffffff;
  transition: background-color 0.3s ease;
  border-radius: 8px;
}.btn:hover {
  background-color: #0057b300;
  color: #fff;
}.label-formulaire {
  font-size: 1.1rem;
  color: #ffffff;
  margin-bottom: 6px;
}input::placeholder, textarea::placeholder {
  color: rgba(255, 255, 255, 0.7); 
  opacity: 1;
}.form-control {
  display: block;
  color: #dedede !important;
  background-clip: padding-box;
  border: none;
  padding: 10px;
  margin-bottom: 1rem;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}.form-control:focus {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-color: #ffffff !important;
}
</style>
