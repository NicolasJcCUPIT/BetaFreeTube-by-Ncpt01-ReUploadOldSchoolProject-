<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
const store = useStore(), routeur = useRouter(), route = useRoute(), urlImage = '/n.png', etapeActuelle = ref(1), email = ref(''), motDePasse = ref(''), messageErreur = ref(''), messageSucces = ref('');

onMounted(() => { if (route.query.accountCreated) {messageSucces.value = 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.'}})
const emailValide = computed(() => email.value.trim() !== '')
const motDePasseValide = computed(() => motDePasse.value.trim() !== '')
const etapeSuivante = () => {  etapeActuelle.value += 1}
const connexion = async () => { if (!motDePasseValide.value) {return}

// Page de connexion
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'http://localhost:3300/FreeTube/API/Utilisateurs/Connexions',
    headers: { 
      'Email': email.value, 
      'Passwd': motDePasse.value
    }};

  try { const response = await axios.request(config)
if (response.status === 200) {
      const { token, user } = response.data
      store.dispatch('login', { token, user })
      routeur.push('/')} 
    else {
      throw new Error('Email ou mot de passe incorrect.');}} 
    catch (error) {
    messageErreur.value = 'Erreur lors de la connexion. Veuillez vérifier vos identifiants.'
    console.error(error)}}
</script>


<template>
  <div class="conteneur mt-5">
    <div><img :src="urlImage" style='width: 155px;' alt="logo Freetube" /></div>
    <h1>Connexion</h1>

    <div v-if="messageSucces"><p class="alert alert-success">{{ messageSucces }}</p></div>

    <div v-if="messageErreur"><p class="alert alert-danger">{{ messageErreur }}</p></div>

    <div v-if="etapeActuelle === 1">
      <div class="carte">
        <div class="corps-de-carte">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control champ-saisie" id="email" v-model="email" required>
          </div>
          <button class="btn btn-principal" @click="etapeSuivante" :disabled="!emailValide">Suivant</button>
        </div>
      </div>
    </div>

    <div v-else-if="etapeActuelle === 2">
      <div class="carte">
        <div class="corps-de-carte">
          <div class="mb-3">
            <label for="motDePasse" class="form-label">Mot de passe</label>
            <input type="password" class="form-control champ-saisie" id="motDePasse" v-model="motDePasse" required>
          </div>
          <button class="btn btn-principal" @click="connexion" :disabled="!motDePasseValide">Connexion</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.mt-5 {
    margin-top: 0rem !important;
    height: 60vh;
    justify-content: center;
    align-items: center;
}.conteneur {
  display: flex;
  flex-direction: column;
  align-items: center;
}.carte {
  margin-top: 20!important;
  width: 400px;
  margin-bottom: 10px;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background-color: #fff0;
  border: none;
}.carte:hover {
  transform: translateY(-5px);
}.corps-de-carte {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}.form-control {
  box-shadow: 0 2px 4px rgba(54, 54, 54, 0.032);
  border-radius: 4px;
  border: 1px solid #ddd;
  transition: box-shadow 0.2s ease;
}.form-control:focus {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}.btn-principal {
  --bs-btn-color: #fff !important;
  --bs-btn-bg: #e76d23 !important;
  --bs-btn-border-color: #e76d23!important;
  --bs-btn-hover-color: #fff !important;
  --bs-btn-hover-bg: #e76d23 !important;
  --bs-btn-hover-border-color: #e76d23 !important;
  --bs-btn-focus-shadow-rgb: 49, 132, 253 !important;
  --bs-btn-active-color: #fff !important;
  --bs-btn-active-bg: #e76d23 !important;
  --bs-btn-active-border-color: #ffffff !important;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125) !important;
  --bs-btn-disabled-color: #fff !important;
  --bs-btn-disabled-bg: #333333 !important;
  --bs-btn-disabled-border-color: #ffffff00 !important;
  box-shadow: 0px 6px 15px 5px rgba(0, 0, 0, 0.11) !important;
  -webkit-box-shadow: 0px 6px 15px 5px rgba(0, 0, 0, 0.11) !important;
  -moz-box-shadow: 0px 6px 15px 5px rgba(0, 0, 0, 0.11) !important;
  margin-top: 10px;
}.champ-saisie {
  margin-top: 10px;
  box-shadow: 0 0px 1px rgba(255, 255, 255, 0.623);
  border-radius: 4px;
  border: 1px solid #ddd;
  transition: box-shadow 0.2s ease;
}.alert-danger {
    --bs-alert-color: #ffffff!important;
    --bs-alert-bg: #e76d23!important;
    --bs-alert-border-color: #212529!important;
    --bs-alert-link-color: #d6d7d8!important;
}.alert-success {
    --bs-alert-color: #ffffff!important;
    --bs-alert-bg: #28a745!important;
    --bs-alert-border-color: #212529!important;
    --bs-alert-link-color: #d6d7d8!important;
}
</style>
