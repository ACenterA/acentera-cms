import lazyLoading from './lazyLoading'

export default {
  meta: {
    label: 'Design',
    icon: 'fa-wrench',
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
      name: 'HomePage',
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
