<template>
  <div class="channel-view" style="color:white">
    <div v-if="loading" class="loading">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="channel-info">
      
        <img :src="channel.imageUrl" alt="Profile Picture" class="channel-profile-pic" />
        <h2>{{ channel.chaineNom }}</h2> 
        <p>{{ channel.description }}</p> 
   
        <div>
          <button v-if="isSubscribed" @click="unsubscribe">Se désabonner</button>
          <button v-else @click="subscribe">S'abonner</button>
        </div>
      </div>
      <div v-if="videos.length === 0" class="no-videos">Aucune vidéo disponible.</div>
      <div v-else>
     
        <ul>
          <li v-for="video in videos" :key="video.id">{{ video.title }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const channel = ref({});
const videos = ref([]);
const isSubscribed = ref(false);
const loading = ref(true);
const error = ref(null);
const subscriptions = ref([]); 
const link = "http://localhost:3300/FreeTube/API/";
console.log("Initialisation des variables", { channel, videos, isSubscribed, loading, error });

// Stats de la chaîne freetube
const fetchChannelData = async () => {
  console.log("Début de fetchChannelData");
  loading.value = true;
  error.value = null;

  try {
    const response = await axios.get(`${link}ChaineInfos?nom=${route.params.channelName}`);
    console.log("Réponse reçue pour fetchChannelData", response.data);
    if (response.data && response.data.reponse) {
      channel.value = response.data.reponse;  
      console.log("Données de la chaîne mises à jour", channel.value);
      await checkSubscription(); 
    } else {
      throw new Error("Les informations de la chaîne sont indisponibles.");}
      
  } catch (err) {
    console.error("Erreur lors de fetchChannelData", err);
    error.value = `Erreur lors de la récupération des informations de la chaîne : ${err.message}`;
  } finally {
    loading.value = false;
    console.log("fetchChannelData terminé", { loading: loading.value, error: error.value });
  }
};

const fetchSubscriptions = async () => {
  console.log("Début de fetchSubscriptions");
  const token = localStorage.getItem("token") || "";
  console.log("Token récupéré depuis localStorage", token);

  try {
    const response = await axios.post(
      `${link}Utilisateurs/Actualites`,
      {},
      {
        headers: { Token: token },
      }
    );
    console.log("Réponse reçue pour fetchSubscriptions", response.data);


    const uniqueSubscriptions = response.data.reponse.reduce((acc, current) => {
      if (!acc.some(sub => sub.v_auth_fk === current.v_auth_fk)) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    subscriptions.value = uniqueSubscriptions;
    console.log("Abonnements uniques mis à jour", subscriptions.value);
  } catch (error) {
    console.error("Erreur lors de fetchSubscriptions", error);
  } finally {
    loading.value = false;
    console.log("fetchSubscriptions terminé", { loading: loading.value });
  }
};

const checkSubscription = async () => {
  console.log("Début de checkSubscription");
  const token = localStorage.getItem('token');
  console.log("Token récupéré pour checkSubscription", token);

  if (!token) {
    console.log("Aucun token trouvé, fin de checkSubscription");
    return;
  }

  try {
    const response = await axios.get(`${link}CheckSubscription?channelName=${route.params.channelName}`, {
      headers: { Token: token }
    });
    console.log("Réponse reçue pour checkSubscription", response.data);


    isSubscribed.value = response.data.reponse.isSubscribed;  
    console.log("isSubscribed mis à jour", isSubscribed.value);
  } catch (err) {
    console.error('Erreur lors de checkSubscription', err);
  }
};

const subscribe = async () => {
  console.log("Début de subscribe");

};

const unsubscribe = async () => {
  console.log("Début de unsubscribe");
};

onMounted(() => {
  console.log("Composant monté, appel de fetchChannelData");
  fetchChannelData();
});
</script>

<style scoped>
.channel-view {
  padding: 20px;
}

.channel-info {
  margin-bottom: 30px;
  text-align: center;
}

.channel-profile-pic {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  margin-bottom: 15px;
}
.loading {
  text-align: center;
  font-size: 18px;
  color: #555;
}
.error {
  text-align: center;
  color: red;
  font-size: 18px;
}
.no-videos {
  text-align: center;
  color: #555;
  font-size: 16px;
}
</style>
