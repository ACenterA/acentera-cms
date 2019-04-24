import lazyLoading from './lazyLoading'

export default {
  meta: {
    label: 'Design',
    icon: 'fa-wrench',
    showOnlyIf: 'isHugo',
    expanded: false
  },
  children: [
/*
    {
      name: 'Static Html',
      path: '/Pages',
      component: lazyLoading('design/Pages')
    },
*/
/*
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
  ]
}
