<script setup>
import { ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import '@fortawesome/fontawesome-free/css/all.css'

const magasin = useStore()
const routeur = useRouter()

const estConnecte = ref(magasin.getters.isAuthenticated)
const estRepliee = ref(true)
const afficherTexte = ref(false)

const deconnexion = () => {
  magasin.dispatch('logout')
  estConnecte.value = false
  routeur.push('/')
}

const basculerBarreLaterale = () => {
  estRepliee.value = !estRepliee.value
}

watchEffect(() => {
  estConnecte.value = magasin.getters.isAuthenticated
})

watch(estRepliee, (newVal) => {
  if (!newVal) {
    setTimeout(() => {
      afficherTexte.value = true
    }, 150)
  } else {
    afficherTexte.value = false
  }
})
</script>

<template>
  <div :class="['sidebar', { 'collapsed': estRepliee }]">
    <button class="toggle-btn" @click="basculerBarreLaterale">
      <i :class="['fas', estRepliee ? 'fa-chevron-right' : 'fa-chevron-left']"></i>
    </button>
    <a class="navbar-brand" href="#" v-if="!estRepliee"></a>
    <ul class="customnavbar-nav">
      <li class="nav-item">
        <a class="nav-link" href="/">
          <i class="fas fa-home"></i>
          <span v-show="afficherTexte">Accueil</span>
        </a>
      </li>
      <li class="nav-item" v-if="estConnecte">
        <a class="nav-link" href="/mes-abonnements">
          <i class="fas fa-heart"></i>
          <span v-show="afficherTexte">Abonnements</span>
        </a>
      </li>
      <li class="nav-item" v-if="estConnecte">
        <a class="nav-link" href="/mes-videos">
          <i class="fas fa-video"></i>
          <span v-show="afficherTexte">Mes Vidéos</span>
        </a>
      </li>
      <li class="nav-item" v-if="estConnecte">
        <a class="nav-link" href="/Playlist">
          <i class="fas fa-list"></i>
          <span v-show="afficherTexte">Mes Listes</span>
        </a>
      </li>
      <li class="nav-item" v-if="estConnecte">
        <a class="nav-link" href="/upload">
          <i class="fas fa-upload"></i>
          <span v-show="afficherTexte">Ajouter Vidéo</span>
        </a>
      </li>
    </ul>
    <ul class="customnavbar-nav mt-auto">
      <li class="nav-item" v-if="!estConnecte">
        <a class="nav-link" href="/connexion">
          <i class="fas fa-sign-in-alt"></i>
          <span v-show="afficherTexte">Connexion</span>
        </a>
      </li>
      <li class="nav-item" v-if="!estConnecte">
        <a class="nav-link" href="/inscription">
          <i class="fas fa-user-plus"></i>
          <span v-show="afficherTexte">Inscription</span>
        </a>
      </li>
      <li class="nav-item" v-if="estConnecte">
        <a class="nav-link" href="/Utilisateur">
          <i class="fas fa-user"></i>
          <span v-show="afficherTexte">Mon Profil</span>
        </a>
      </li>
      <li class="nav-item" v-if="estConnecte">
        <button class="nav-link btn btn-link" @click="deconnexion">
          <i class="fas fa-sign-out-alt"></i>
          <span v-show="afficherTexte">Déconnexion</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style>
@media (max-width: 874px) {
  .sidebar {
    width: 54px !important;
    left: -22px !important;
  }
  .sidebar.collapsed {
    width: 54px !important;
  }
  .toggle-btn {
    display: none;
  }
}.sidebar {
  z-index: 1000;
  height: 100%;
  width: 240px;
  position: fixed;
  top: 0;
  left: 0;
  background-color: #2a3538;
  background-image: linear-gradient(160deg, #2d3b3f 0%, #2a3538 100%);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: start;
  transition: width 0.3s ease;
  color: #fff;
  overflow-x: hidden;
}.sidebar.collapsed {
  width: 72px;
}.toggle-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  margin: 10px;
  color: #fff;
}.navbar-brand {
  margin-left: 16px;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}.customnavbar-nav {
  --bs-nav-link-padding-x: 0;
  --bs-nav-link-padding-y: 0.5rem;
  --bs-nav-link-font-weight: ;
  --bs-nav-link-color: var(--bs-navbar-color);
  --bs-nav-link-hover-color: var(--bs-navbar-hover-color);
  --bs-nav-link-disabled-color: var(--bs-navbar-disabled-color);
  display: flex;
  flex-direction: column;
  list-style: none;
}.nav-item {
  width: 100%;
}.nav-link {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  text-decoration: none;
  color: #fff;
  width: 100%;
  transition: padding 0.2s ease;
}.nav-link i {
  margin-right: 16px;
}.nav-link:hover {
  background-color: #343a40;
  color: #fff;
}.mt-auto {
  margin-top: auto;
}
</style>
