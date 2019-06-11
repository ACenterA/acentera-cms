<template>
  <div class="plekan-area">
    <ul id="right-click-menu" tabindex="-1" @blur="closeMenu" class="right-click-menu" style="display: none;">
      <li v-if="getViewMenuType === 'imageonly'" @click="changeImageMenu">Change Image</li>
      <li v-if="getViewMenuType === 'nav'">Modify Navigation</li>
    </ul>

    <!-- This components for Preview and Translate language change  -->
    <!-- change-language v-if="store.state.languages.length > 1"></change-language -->
    <!-- Arena Container  -->
    <div :class="{'plekan-translate-mode' : translateMode}"
         class="plekan-container" style="height:100%">
      <i-frame class="arenatest" style="width:100%; height:100%" @contextmenu="openMenu()">
      <!-- Arena Column - Preview  -->
      <arena-column :isTranslate="false"
                    :rows="rows"
                    :editAsHTMLRow="editAsHTMLRow"
                    :language="currentLanguge"></arena-column>
      </i-frame>

      <!-- Edit As HTML Modal  -->
      <modal :show="editRow.row ? true : false"
             class="edit-modal">
        <header slot="header">
          <div class="plekan-modal-title">Edit As Html</div>
        </header>
        <div slot="body"
             class="plekan-edit-as-html-modal-body">
          <textarea v-model="editRow.html"></textarea>
        </div>
        <footer slot="footer"
                class="plekan-clearfix">
          <button type="button"
                  @click.prevent="saveEditAsHtml">Save HTML</button>
        </footer>
      </modal>
    </div>

    <div class="plekan-container">
      <!-- <pre>{{store.state.rows}}</pre> -->
      <!--
      <div class="plekan-footer">
        <button v-for="b in $plekan_buttons"
                type="button"
                :class="b.class"
                @click="b.callback(returnStoreRows)">
          {{b.text}}
        </button>
      </div>
      -->
    </div>

  </div>
</template>

<script>

import Vue from 'vue'
import Sortable from 'sortablejs'
import store from '../../store'
import modal from 'components/plekan/modal'
import { arenaSortableOptions } from '../../plekan/src/core/sortable_options'
// import changeLanguage from 'components/changeLanguage'
import arenaColumn from 'components/plekan/arenaColumn'

Vue.component('i-frame', {
  render (h) {
    return h('iframe', {
      on: { load: this.renderChildren }
    })
  },
  beforeUpdate () {
    // freezing to prevent unnessessary Reactifiation of vNodes
    this.iApp.children = Object.freeze(this.$slots.default)
  },
  methods: {
    // WARNING THIS IS FOR THE IFRAME ONLY
    renderChildren () {
      if (window.location.href.indexOf('acentera.com') !== -1) {
        window.document.domain = 'acentera.com'
      }
      const children = this.$slots.default
      const body = this.$el.contentDocument.body
   
      console.error('MAIN....BODY CLASS NEED TO BE SET HERE??')
      console.error(this)

      const el = document.createElement('DIV') // we will mount or nested app to this element
      body.appendChild(el)

      const iApp = new Vue({
        name: 'iApp',
        // freezing to prevent unnessessary Reactifiation of vNodes
        data: { children: Object.freeze(children) },
        render (h) {
          return h('div', this.children)
        }
      })

      iApp.$mount(el) // mount into iframe

      this.iApp = iApp // cache instance for later updates
    }
  }
})

/**
 * NOTE FOR DEVELOPERS *****
 *
 * You can understand this section once you use pelikan.
 *
 * This component is a body for application. This component contains;
 * translate area , preview area , which language choose for displaying by
 * user.
 *
 * For example: Modal is used to edit component as HTML.
 */
export default {
  props: [],
  data () {
    return {
      // @type {Object} Each component, use and access the global store.
      store,
      // @type {Object} The object consists of language,html,index and row properties.
      editRow: {
        lang: null,
        html: null,
        index: null,
        row: null
      }
    }
  },
  /**
   * Components are used in the area
   * @todo If you don't have any idea of components keyword:
   * https://vuejs.org/guide/components.html
   */
  components: {
    modal,
    arenaColumn
  },
  computed: {
    getViewMenuType () {
      if (this.viewMenuType) {
        if (this.viewMenuType.type) {
          return this.viewMenuType.type
        }
      }
      return ''
    },
    /**
     * Clean observable object
     * @return {Array} Store rows
     */
    viewMenu () {
      return this.store.state.app.viewMenu
    },

    viewMenuType () {
      return this.store.state.app.viewMenuType
    },

    top () {
      return this.store.state.app.viewMenuPos.top
    },

    left () {
      return this.store.state.app.viewMenuPos.left
    },

    returnStoreRows () {
      return JSON.parse(JSON.stringify(this.store.state.rows))
    },
    /**
     * This method return a boolean value for split arena of which preview
     * language
     *
     * Hesaplanan değer ekranı iki veya tek şekilde göstermek için
     * kullanılır Bu durum arena'nın boş olması durumdaki görüntüyüde
     * etkiler change-language komponent'i tarafından değiştirilir
     * @private
     * @return {Boolean}
     */
    translateMode () {
      return this.store.state.translateMode
    },
    /**
     * Global store'da tutulan ve ekranda gösterilecek her bir row'un
     * bulunduğu diziyi hesaplar.
     * @private
     * @return {Array}  https://github.com/abdullah/plekan#row-objesi
     */
    rows () {
      return this.store.state.rows
    },
    /**
     * currentLanguge hesaplaması change-language içindeki select'lere bağlı
     * çalışır ekranda gösterilecek row'ların hangi dilde olacağını hesaplar
     * . plekan.js dosyasında dışardan alının seçeneklere göre ilk ( init )
     * zamanında belirlenir ve sonradan değiştirilebilirdir
     * https://github.com/abdullah/plekan#seçenekler
     * @private
     * @return {String}
     */
    currentLanguge () {
      return this.store.state.currentLanguge
    },
    /**
     * currentLanguge ile aynı özelliklere sahiptir. Ekran ikiye
     * bölündüğünde translate olacak kısımın hangi dilde olması gerektiğinin
     * hesaplar bu translateMode'un aktif (true) olduğunu gösterir
     * @private
     * @return {String}
     */
    translateLanguage () {
      return this.store.state.translateLanguage
    },
    /**
     * Eklentiye tanıtılmış her bir row'un üretileceği komponent'leri temsil
     * eder.Özel olarak yazılmış veya daha önceden eklentinin çekirdeğinde
     * yer alan modül listeleridir. plekan.js içinde init zamanında global
     * store kayıt edilir.
     * @private
     * @return {Object}  /src/core/modules/list.json
     */
    list () {
      return this.store.state.moduleList
    }
  },
  mounted () {
    /*
     * Sortable options init , see: https://github.com/RubaXa/Sortable
    */
    const d = document.getElementsByTagName('iframe')[0].contentWindow.document
    const el = d.getElementById('plekan-sortable-list')
    Sortable.create(el, {
      ...arenaSortableOptions,
      onAdd: this.onAdd,
      onEnd: this.onEnd
    })
    /*
     * Modal komponenti kapatılmak istendiğinde tetiklenir. Kapatma isteği
     * "kapatma" ikonuna veya modal dışına tıklandığında tetiklenir Bu
     * olaydinlemesi güvenli çıkış olarak kullanılabilir.
     * @TODO : Move function in requestHiddenModal from to  new function
    */

    this.$bus.$on('requestHiddenModal', () => {
      if (this.editRow.row) {
        /* eslint-disable */
        Object.keys(this.editRow).map((e) => this.editRow[e] = null)
        /* eslint-enable */
      }
    })
  },
  methods: {
    changeImageMenu: function () {
      this.$bus.$emit('TOGGLE_EDITABLE_ELEMENT', this.viewMenuType.el) // set the target
      this.closeMenu()
    },
    setMenu: function (top, left) {
      var largestHeight = window.innerHeight - this.$$.right.offsetHeight - 25
      var largestWidth = window.innerWidth - this.$$.right.offsetWidth - 25

      if (top > largestHeight) top = largestHeight

      if (left > largestWidth) left = largestWidth

      this.top = top + 'px'
      this.left = left + 'px'
    },

    closeMenu: function () {
      this.$store.commit('toggleViewMenu', false)
      // this.viewMenu = false
    },

    openMenu: function (e) {
      this.viewMenu = true

      Vue.nextTick(function () {
        this.$$.right.focus()

        this.setMenu(e.y, e.x)
      }.bind(this))
      e.preventDefault()
    },
    /**
     * Bu method arena-column komponent'i içerisinden çağrılır. Bu method
     * arena-column komponentine özellik olarak geçilir (pass edilir).
     *
     * Bu method'a gelen değerler local scope'daki "editRow" objesinde
     * saklanır.
     *
     * Temel mantık için arena-column'a bakın.
     * @param  {Object} row      Düzenlenecek row'un kendisi
     * @param  {Number} index    Store objesinin içinde hangi index'te yer
     * aldığı
     * @param  {String} language Hangi dil için düzenleme yapılacağı
     * @return {void}
     */
    editAsHTMLRow (row, index, language) {
      this.editRow.row = JSON.parse(JSON.stringify(row))
      this.editRow.lang = language
      this.editRow.index = index
      this.editRow.html = this.editRow.row.contents[language].html
    },
    /**
     * editRow objesi store'daki asıl obje ile değiştirilir editRow objesi
     * işlem bittikten sonra bolaştılır
     * @return {void}
     */
    saveEditAsHtml () {
      this.editRow.row.contents[this.editRow.lang].html = this.editRow.html
      this.store.updateRows(this.editRow.index, this.editRow.row)
      /* eslint-disable */
      Object.keys(this.editRow).map(e => this.editRow[e] = null)
      /* eslint-enable */
    },
    /**
     * see: https://github.com/RubaXa/Sortable
     * @param  {Object of Sortable Event} evt
     * @return {void}
     * @todo Global event atanacak.
     * https://github.com/abdullah/plekan#olay-yakalama
     *
     * Sortable eklentesi tarafından sürükleme bittiğinde sürüklenen liste
     * elemanın bir kopyasını oluşturur.
     * @todo daha iyi anlamak için fonksiyonu kaldırın.
     */
    onAdd (evt) {
      evt.item.remove()
    },
    /**
     * Row'ların yer değiştirmesinden sonra bu event tetiklenir
     * Yeni ve eski yerlerine göre store güncellenir
     * @param  {Object of Sortable Event} evt
     * @return {void}
     */
    onEnd (evt) {
      this.store.sortRows(evt.newIndex, evt.oldIndex)
    }
  }
}
</script>
<style>

  .right-click-menu{
      background: #FAFAFA;
      border: 1px solid #BDBDBD;
      box-shadow: 0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12);
      display: block;
      list-style: none;
      margin: 0;
      padding: 0;
      position: absolute;
      width: 250px;
      z-index: 999999;
  }

  .right-click-menu li {
      border-bottom: 1px solid #E0E0E0;
      margin: 0;
      padding: 5px 35px;
  }

  .right-click-menu li:last-child {
      border-bottom: none;
  }

  .right-click-menu li:hover {
      background: #1E88E5;
      color: #FAFAFA;
  }

</style>
