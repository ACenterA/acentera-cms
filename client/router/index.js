import Vue from 'vue'
import Router from 'vue-router'
import menuModule from 'vuex-store/modules/menu'
Vue.use(Router)

export default new Router({
  // mode: 'hash', // Demo is living in GitHub.io, so required!
  mode: 'history',
  linkActiveClass: 'is-active',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    {
      name: 'Home',
      path: '/',
      component: require('../views/Home')
    },
    {
      name: 'Templates',
      path: '/templates',
      component: require('../views/Templates')
    },
    {
      name: 'TemplatesPreview',
      path: '/templates/:id/preview',
      component: require('../views/TemplatesPreview')
    },
    {
      name: 'TemplatesEdit',
      path: '/templates/:id/edit',
      component: require('../views/TemplatesEdit')
    },
    {
      name: 'OAuth',
      path: '/oauth/:provider/authorize',
      component: require('../views/oauth/Authorize')
    },
    ...generateRoutesFromMenu(menuModule.state.items),
    {
      path: '*',
      redirect: '/'
    }
  ]
})

// Menu should have 2 levels.
function generateRoutesFromMenu (menu = [], routes = []) {
  for (let i = 0, l = menu.length; i < l; i++) {
    let item = menu[i]
    if (item.path) {
      routes.push(item)
    }
    if (!item.component) {
      generateRoutesFromMenu(item.children, routes)
    }
  }
  return routes
}
