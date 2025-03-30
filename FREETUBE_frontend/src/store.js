import { createStore } from 'vuex'
const store = createStore({
  state: {
    token: null,
    user: null,
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
    },
    SET_USER(state, user) {
      state.user = user
    },
    LOGOUT(state) {
      state.token = null
      state.user = null
    }
  },
  actions: {
    login({ commit }, { token, user }) {
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
      localStorage.setItem('token', token)
    },
    logout({ commit }) {
      commit('LOGOUT')
      localStorage.removeItem('token')
    },
    tryAutoLogin({ commit }) {
      const token = localStorage.getItem('token')
      if (token) {
        commit('SET_TOKEN', token)
      }
    }
  },
  getters: {
    isAuthenticated(state) {
      return !!state.token
    },
    getUser(state) {
      return state.user
    }
  }
})

export default store
