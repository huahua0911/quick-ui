import 'normalize.css'
import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/packages/theme-chalk/lib/index.css'

// import QuickUI from '@c'
import QuickUI from '@/components/index.js'
// import '/lib/incar-quick-ui.css'

import router from '@/router'

Vue.config.productionTip = false

window.Vue = Vue

Vue.use(ElementUI)
Vue.use(QuickUI, { iconfont: 'qk-icon' })

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
