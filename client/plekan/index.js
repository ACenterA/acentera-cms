/* eslint no-underscore-dangle: ["error", { "allow": ["_modules"] }] */
import './src/core/plekan/plekan_editor.js'
// import plekancomponent from 'components/plekan/plekan.vue'
import store from '../store'
import './src/helper'
import '../assets/plekan/style/app.scss'
import plekanComponentMixin from './src/core/mixin'

/** @type {Object} Eklentinin ta kendisi lol */
const plekan = {}

console.error('test plekan 01')
/**
   * @description Varsayılan seçenekler
   * @type {Object}
   */
const plekanOptions = {
  languages: [],
  defaultLanguage: '',
  /**
     * @type {Array} Ekrandaki gösterilen
     * her bil satır. Uygulama genelinde rows olarak belirtirlir */
  rows: [],
  /** @type {Object} Row olarak eklenebilen her component module olarak adlandırılır */
  modules: {},
  /** @type {Array} Özel butonlar  */
  customEditorButtons: [],
  allowedFileTypes: '',
  plekan_buttons: {},
  plekanEvent: {
    onAdd: () => {},
    onDelete: () => {},
    onSort: () => {},
    onDuplicate: () => {},
    onUpdate: () => {},
    onInit: () => {}
    /** Bu kısım  comment out olmalı ki onFileUpload özelliğine göre yükleme yapıyor */
    // onFileUpload : () => {},
  }
}

plekan.install = (Vue, optionsOut) => {
  /** plekan komponnetinin kayıt edilmesi */
  console.error('INSTALATION???')
  console.error(Vue)
  const options = Object.assign({}, plekanOptions, optionsOut)
  options.plekanEvent = Object.assign(
    {},
    plekanOptions.plekanEvent,
    optionsOut.plekanEvent
  )

  // Vue.component('plekan', plekancomponent)
  if (!options.languages || !options.languages.length) {
    throw new Error('languages is not set')
  }
  if (!options.defaultLanguage) {
    throw new Error('defaultLanguage is not set..')
  }
  if (!options.modules) throw new Error('modules is not set..')

  /*
     * Register component initilaze
     * @TODO : Validate template for existing ?????
    */
  console.error(store)
  store.commit('setLanguage', options.languages)
  /*
    * İnit rows
    */
  if (options.rows) {
    store.commit('setRows', options.rows)
  }
  /*
    * Init Custom components
    */

  const _modules = Object.assign([], options.modules)

  /*
    * Set contents language
    */
  /* eslint-disable */
  const oList = _modules.map(m => {
    // Register Component
    m.contents = m.contents || {}

    store.state.languages.map(l => {
      m.contents[l] = {}
      m.contents[l].html = ""
      m.contents[l].fields = {}

      return true;
    });

    console.error('fafa');
    console.error(m);
    console.error(m.context);
    console.error(m.name);
    try {

      console.error('CREATE COMPONENT OF...')
      if (m.hasOwnProperty('newContext')) {
        var tt = {};
        Object.assign(tt,m.context);
        Object.assign(tt,m.newContext);

        Vue.component(m.name, tt);//Object.assign(m,m.context));
      } else {
        Vue.component(m.name, Object.assign({}, m.context));
      }
    } catch (f) {
      console.error(f.stack);
    }

    delete m.context;
    return m;
  });

  store.commit("moduleList", oList);
  store.commit("currentLanguge", options.defaultLanguage);
  store.commit("translateLanguage", options.languages[1]);


    Vue.prototype.$plekan_buttons = options.plekan_buttons;
    Vue.prototype.$customEditorButtons = options.customEditorButtons;
    Vue.prototype.$thumbnailPath = options.thumbnailPath || "/";
    Vue.prototype.$allowedFileTypes = options.allowedFileTypes;
    Vue.prototype.$plekanEvent = options.plekanEvent;

    /**
       *
       * http://stackoverflow.com/questions/1303872/trying-to-validate-url-using-javascript
       * @type {Object}
       */
    Vue.prototype.$plekanutils = {
      makeUrl(url, prefix) {
        const RegExp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        if (RegExp.test(url)) {
          return url;
        }
        console.error('MAKE URL' + prefix + url)
        return prefix + url;
      },
    };

};

console.error('test plekan 02')
/*
module.export = {
  plekan: plekan,
  plekanComponentMixin:plekanComponentMixin
}
*/
export default {
  plekan  : plekan,
  plekanComponentMixin: plekanComponentMixin
}

// export { plekan }
// export { plekanComponentMixin }
