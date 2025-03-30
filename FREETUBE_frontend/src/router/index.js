import { createRouter, createWebHistory } from 'vue-router';
import Accueil from '../views/Accueil.vue';
import Connexion from '../views/Connexion.vue';
import Inscription from '../views/Inscription.vue';
import MonProfil from '../views/MonProfil.vue';
import MesVideos from '../views/MesVideos.vue';
import Playlist from '../views/Playlist.vue';
import upload from '../views/upload.vue';
import MesAbonnements from '../views/MesAbonnements.vue';
import VueChaine from '../components/VueChaine.vue';
import mpp from '../components/Modifierpp.vue';

const routes = [
  { path: '/', component: Accueil },
  { path: '/connexion', component: Connexion },
  { path: '/inscription', component: Inscription },
  { path: '/Utilisateur', component: MonProfil },
  { path: '/mes-videos', component: MesVideos },
  { path: '/Playlist', component: Playlist },
  { path: '/upload', component: upload },
  { path: '/mpp', component: mpp },
  { path: '/mes-abonnements', component: MesAbonnements },
  { path: '/chaine/:channelName', component: VueChaine, props: true },];

const routeur = createRouter({
  history: createWebHistory(),
  routes,});
routeur.beforeEach((to, from, next) => {
const token = localStorage.getItem('token');
  
  // les routes qui nécessitentt d'être authentifier
  const requiresAuth = ['/Utilisateur', '/mes-videos', '/mes-abonnements', '/upload', '/Playlist','/mpp'];
  if (requiresAuth.includes(to.path) && !token) {
    next('/'); 
  } else {
    next(); }});
export default routeur;
