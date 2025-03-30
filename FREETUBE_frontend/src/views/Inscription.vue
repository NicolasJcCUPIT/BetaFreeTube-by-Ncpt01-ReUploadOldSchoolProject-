<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'  


// Page d'inscription...
const imageUrl = '/n.png', router = useRouter(), etapeActuelle = ref(1), nomUtilisateur = ref(''), nom = ref(''), prenom = ref(''), 
email = ref(''), motDePasse = ref(''), age = ref(null), erreurMotDePasse = ref(''), motDePasseValide = ref(false),
 forceMotDePasse = ref(0), classeForceMotDePasse = ref('bg-danger'), modalVisible = ref(false), messageModal = ref(''), 
 regexLettres = /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/, emailValide = computed(() => email.value.trim() !== '' && email.value.includes('@')), 
 nomsValides = computed(() => regexLettres.test(nom.value.trim()) && regexLettres.test(prenom.value.trim()) && /^[a-z0-9\.]{4,20}$/.test(nomUtilisateur.value.trim())), 
 ageValide = computed(() => age.value !== null && age.value >= 18);
const validerMotDePasse = () => {
const valeurMotDePasse = motDePasse.value, minLongueur = /.{12,}/, majuscule = /[A-Z]/, minuscule = /[a-z]/, chiffre = /\d/,  caractereSpecial = /[!@#\$%\^\&*\)\(+=._\-:|;'",<>\[\]\{\}\/?`~]/;  
let force = 0
  if (minLongueur.test(valeurMotDePasse)) force += 20
  if (majuscule.test(valeurMotDePasse)) force += 20
  if (minuscule.test(valeurMotDePasse)) force += 20
  if (chiffre.test(valeurMotDePasse)) force += 20
  if (caractereSpecial.test(valeurMotDePasse)) force += 20
  forceMotDePasse.value = force
  if (force < 40) {
    classeForceMotDePasse.value = 'bg-danger'
    erreurMotDePasse.value = 'Le mot de passe est trop faible.'
    motDePasseValide.value = false  } 
    else if (force < 60) {
    classeForceMotDePasse.value = 'bg-warning'
    erreurMotDePasse.value = 'Le mot de passe pourrait être plus fort.'
    motDePasseValide.value = false} 
    else if (force < 90) {
    classeForceMotDePasse.value = 'bg-info'
    erreurMotDePasse.value = ''
    motDePasseValide.value = false} 
    else {
    classeForceMotDePasse.value = 'bg-success'
    erreurMotDePasse.value = ''
    motDePasseValide.value = true}}
const etapeSuivante = () => {etapeActuelle.value += 1}

const inscription = async () => {
  if (!motDePasseValide.value) {
    afficherModal('Le mot de passe ne respecte pas les critères.')
    return}
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://localhost:3300/FreeTube/API/Utilisateurs/Creations',
    headers: { 
    'Utilisateur': nomUtilisateur.value,'Nom': nom.value,'Prenom': prenom.value,'Email': email.value,'Passwd': motDePasse.value,'Age': age.value.toString()}};
      axios.request(config)
  .then((response) => {
    if (response.status === 200) {  router.push({ path: '/connexion', query: { accountCreated: true } });} 
    else {  afficherModal(JSON.stringify(response.data))}})
    .catch((error) => {afficherModal(error.message)});  }

const afficherModal = (message) => {messageModal.value = message,modalVisible.value = true}
const fermerModal = () => { modalVisible.value = false}
</script>


<template>
  <div class="conteneur mt-5">
    <div><img :src="imageUrl" style='width: 155px;' alt="logo Freetube" /></div>
    <h1>Inscription</h1>
    <div v-if="etapeActuelle === 1">
      <div class="carte">
        <div class="corps-carte">
       <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <input type="email" class="form-control champ-saisie" id="email" v-model="email" required>
        </div>
          <button class="btn btn-primary" @click="etapeSuivante" :disabled="!emailValide">Suivant</button>
        </div>
      </div>
    </div>
    <div v-else-if="etapeActuelle === 2">
      <div class="carte">
        <div class="corps-carte">
          <div class="mb-3">
            <label for="nom" class="form-label">Nom</label>
            <input type="text" class="form-control champ-saisie" id="nom" v-model="nom" required>
          </div>
          <div class="mb-3">
            <label for="prenom" class="form-label">Prénom</label>
            <input type="text" class="form-control champ-saisie" id="prenom" v-model="prenom" required>
          </div>
          <div class="mb-3">
            <label for="nomUtilisateur" class="form-label">Nom d'utilisateur</label>
            <input type="text" class="form-control champ-saisie" id="nomUtilisateur" v-model="nomUtilisateur" required>
          </div>
          <p>Le nom d'utilisateur doit contenir au moins 4 caractères sans espace.</p> 
          <button class="btn btn-primary" @click="etapeSuivante" :disabled="!nomsValides">Suivant</button>
        </div>
      </div>
    </div>

    <div v-else-if="etapeActuelle === 3">
      <div class="carte">
        <div class="corps-carte">
          <div class="mb-3">
            <label for="age" class="form-label">Âge</label>
            <input type="number" class="form-control champ-saisie" id="age" v-model="age" required>
          </div>
          <button class="btn btn-primary" @click="etapeSuivante" :disabled="!ageValide">Suivant</button>
        </div>
      </div>
    </div>
    <div v-else-if="etapeActuelle === 4">
      <div class="carte">
        <div class="corps-carte">
          <div class="mb-3">
            <label for="motDePasse" class="form-label">Mot de passe</label>
            <input type="password" class="form-control champ-saisie" id="motDePasse" v-model="motDePasse" @input="validerMotDePasse" required>
            <p class="Indmdp"> min. 12 caractères, avec majuscule, minuscule, chiffre et caractère spécial</p>
            <div class="progress mt-2">
              <div class="progress-bar" :class="classeForceMotDePasse" :style="{ width: forceMotDePasse + '%' }"></div>
            </div>
            <div v-if="erreurMotDePasse" class="text-danger">{{ erreurMotDePasse }}</div>
          </div>
          <button class="btn btn-primary" @click="inscription" :disabled="!motDePasseValide">S'inscrire</button>
        </div>
      </div>
    </div>

    <div v-if="modalVisible" class="modal" tabindex="-1" style="display: block;">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Message de la console</h5>
            <button type="button" class="btn-close" @click="fermerModal"></button>
          </div>
          <div class="modal-body"> <p>{{ messageModal }}</p> </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="fermerModal">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style>
.conteneur {
  display: flex;
  flex-direction: column;
  align-items: center;
}.mt-5 {
    margin-top: 0rem !important;
    height: 60vh;
    justify-content: center;
    align-items: center;
}.carte {
  width: 300px;
  margin-top: 20px;
  margin-bottom: 10px;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: none;
}.carte:hover {
  transform: translateY(-5px);
 
}.corps-carte {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}.champ-saisie {
  margin-top: 10px;
  box-shadow: 0 0px 1px rgba(255, 255, 255, 0.623);
  border-radius: 4px;
  border: 1px solid #ddd;
  transition: box-shadow 0.2s ease;
  color: white!important;;
}.champ-saisie:focus {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}.progress-bar {
  transition: width 0.6s ease;
}.indmdp{
  color: #b3b3b3;
  font-weight: 400;
}.btn-primary {
  --bs-btn-color: #fff !important;
    --bs-btn-bg: #e76d23 !important;
    --bs-btn-border-color: #e76d23 !important;
    --bs-btn-hover-color: #fff !important;
    --bs-btn-hover-bg: #e76d23 !important;
    --bs-btn-hover-border-color: #e76d23 !important;
    --bs-btn-focus-shadow-rgb: 49, 132, 253 !important;
    --bs-btn-active-color: #fff !important;
    --bs-btn-active-bg: #e76d23 !important;
    --bs-btn-active-border-color: #ffffff !important;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125) !important;
    --bs-btn-disabled-color: #fff !important;
    --bs-btn-disabled-bg: #333333!important;
    --bs-btn-disabled-border-color: #ffffff00 !important;
    box-shadow: 0px 6px 15px 5px rgba(0, 0, 0, 0.11) !important;
    -webkit-box-shadow: 0px 6px 15px 5px rgba(0, 0, 0, 0.11) !important;
    -moz-box-shadow: 0px 6px 15px 5px rgba(0, 0, 0, 0.11) !important;
    margin-top: 10px;
}.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}.modal-dialog {
  margin: 10% auto;
}.modal-content {
  padding: 20px;
}.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #000;
  cursor: pointer;}
</style>
