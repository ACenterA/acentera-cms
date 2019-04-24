import lazyLoading from './lazyLoading'
// this file is bad ?
export default {
  meta: {
    label: 'Desigbbadn',
    icon: 'fa-wrench',
    showOnlyIf: 'badd not good file',
    expanded: false
  },
  children: [
/*    {
      name: 'Static Html',
      path: '/Pages',
      component: lazyLoading('design/Pages')
    },
    {
      name: 'Widget',
      path: '/widget',
      component: lazyLoading('design/Widgets')
    },
*/
    {
      name: 'HomePagbbbade',
      path: '/homepage',
      component: lazyLoading('design/Homepage')
    }
    /*
    {
      name: 'Token Creator',
      path: '/create-token',
      component: lazyLoading('tools/CreateToken')
    },
    {
      name: 'Wrapper',
      path: '/wrapper',
      component: lazyLoading('tools/Wrapper')
    }
    */
  ]
}
