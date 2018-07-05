import lazyLoading from './lazyLoading'

export default {
  meta: {
    label: 'Administration',
    icon: 'fa-cogs',
    expanded: true
  },
  children: [
    {
      name: 'Site',
      path: '/site',
      showOnlyIf: 'isHugo',
      component: lazyLoading('admin/Sites')
    },
    {
      name: 'Theme',
      path: '/theme',
      showOnlyIf: 'isHugo',
      component: lazyLoading('admin/Themes')
    },
    {
      name: 'Domains',
      path: '/domains',
      component: lazyLoading('admin/Domains')
    },
    {
      name: 'Danger Zone',
      path: '/danger',
      component: lazyLoading('admin/Danger')
    }
    /*
    {
      name: 'Items Type',
      path: '/items',
      component: lazyLoading('admin/Items')
    }
    */
/*
    {
      name: 'Policies',
      path: '/policies',
      component: lazyLoading('admin/Policies')
    },
    {
      name: 'Mounts',
      path: '/mounts',
      component: lazyLoading('admin/Mounts')
    },
    {
      name: 'Requests',
      path: '/requests',
      component: lazyLoading('admin/Requests')
    }
    */
  ]
}
