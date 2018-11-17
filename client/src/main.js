import Vue from 'vue';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css'

Vue.use(Buefy);

import '@mdi/font/css/materialdesignicons.css';

Vue.config.productionTip = false;

import App from './App.vue';

Vue.prototype.$vueEventBus = new Vue(); // Global event bus

new Vue({
  render: h => h(App),
}).$mount('#app');