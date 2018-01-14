<template>
  <div class="_plekan_list animated active">
    <span class="_plekan_list_title">Component List</span>
    <button type="button"
            @click="openModuleList"
            class="plekan-open-module-list">
      <i class="fa fa-angle-left"></i>
    </button>
    <div id="plekan-module-sortable-list">
      <span class="plekan-list-item"
            v-for="(l,key) in list"
            href="#"
            v-bind:data-index="key"
            v-on:click="addRowT(l,key)">
        <img class="plekan-move-row"
             :src="$plekanutils.makeUrl(l.thumbnail,$thumbnailPath)" />
      </span>
    </div>
  </div>
</template>

<script>
import store from '../../store'
// import Sortable from 'sortablejs';
// import { listSortableOptions } from '../../plekan/src/core/sortable_options';

export default {
  data () {
    return {
      store
    }
  },
  computed: {
    list () {
      return this.store.state.moduleList
    }
  },
  mounted () {
    /*
    * Sortable options init
    */
    const el = document.getElementById('plekan-module-sortable-list')
    if (el === undefined || el === null) {
      console.error('EL IS UNDEF')
    }
    /*
    console.error('EL 0111111')
    Sortable.create(el, {
      ...listSortableOptions,
      onRemove: (e) => {
        const index = e.clone.dataset.index;
        this.addRow(index, e.newIndex);
        this.attachEvent();
      },
    });
    */

    // this.attachEvent();
  },
  methods: {
    openModuleList () {
      document.querySelector('._plekan_list').classList.toggle('active')
      document.querySelector('._plekan_list').classList.toggle('deactive')
    },
    attachEvent () {
      console.error('attach events test')
      const els = this.$el.querySelectorAll('.plekan-list-item')
      Object.keys(els).map((i) => {
        els[i].onclick = (evt) => {
          evt.preventDefault()
          this.addRow(els[i].dataset.index)
        }
        return true
      })
    },
    addRowT (t, sortindex) {
      // this.$store.addRow(tmprow, sortindex)
      const tmprow = t // this.list[rowindex]
      // console.error(tmprow)
      // console.error(this.store)
      // this.store.addRow(tmprow, sortindex)
      this.store.commit('addRow', tmprow, sortindex)
    },
    addRow (rowindex, sortindex) {
      const tmprow = this.list[rowindex]
      this.store.commit('addRow', tmprow, sortindex)
    }
  }
}

</script>
