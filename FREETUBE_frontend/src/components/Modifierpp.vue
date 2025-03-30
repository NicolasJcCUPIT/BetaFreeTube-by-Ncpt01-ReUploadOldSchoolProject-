<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
const router = useRouter();
const photoProfil = ref(null);
const message = ref("");
const erreur = ref("");
const chargement = ref(false);
const lien = "http://localhost:3300/";

// Gestion de la photo de profil
const envoyerPhotoProfil = async () => {
  const token = localStorage.getItem("token") || "";
  if (!token) {
    router.push('/');
    return;  }
  if (!photoProfil.value) {
    erreur.value = "Veuillez sélectionner une image.";
    return;}
  const formData = new FormData();
  formData.append('Pp', photoProfil.value);
try {
    chargement.value = true;
    const reponse = await axios.put(
      `${lien}FreeTube/API/Utilisateurs/Modif/Pp`,
      formData,
      {headers: {
          'Content-Type': 'multipart/form-data',
          'Token': token}});

    if (reponse.data.reponse) {
      message.value = reponse.data.reponse;
      erreur.value = '';
      ElMessage.success(message.value);
      router.push('/Utilisateur');}
    else {
      erreur.value = "Erreur lors de la mise à jour de la photo de profil.";
      ElMessage.error(erreur.value);}}
     catch (err) {
    erreur.value = "Erreur serveur: " + (err.response?.data?.reponse || err.message);
    ElMessage.error(erreur.value);}
     finally {
    chargement.value = false;}};
    const selectionnerImage = (event) => {
    const fichier = event.target.files[0];
    if (fichier) {
    const nomFichierNettoye = fichier.name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const fichierRenomme = new File([fichier], nomFichierNettoye, { type: fichier.type });
    photoProfil.value = fichierRenomme;
    erreur.value = '';}};
</script>

<template>
  <div class="container mt-5">
    <div class="card p-4 shadow-sm" style="background-color: #1b2224a6;color: unset;">
        <h2 class="mb-4">Modifier votre photo de profil</h2>
      <div class="mb-3">
        <input type="file" class="form-control" @change="selectionnerImage" accept="image/*" />
      </div>
      <button @click="envoyerPhotoProfil" class="btn btn-primary w-100" :disabled="chargement">
        <span v-if="chargement" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Envoyer</button>
      <div v-if="message" class="alert alert-success mt-3">{{ message }}</div>
      <div v-if="erreur" class="alert alert-danger mt-3">{{ erreur }}</div>
    </div>
  </div>
</template>

<style scoped>
.card {max-width: 500px;
  margin: 0 auto;}
</style>