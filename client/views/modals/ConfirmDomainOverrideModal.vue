<template>
  <modal :visible="visible" @close="close">
    <div class="box">
      <article class="media">
        <div class="media-content">
          <div class="content">
            <p>
              The domain <b>{{ domain }}</b> is already associated with another website configuration that you own.<br/>
              <br/>
              <br/>
              Do you want to replace its association to this website ?
              <br/>
              <br/>
              <br/>
              <a class="button is-primary float-right" @click="confirmed">
                <span>Yes</span>
                <span class="icon">
                  <!-- <i class="fa fa"></i> -->
                </span>
              </a>
              <a class="button is-warning float-right right-m" @click="close">
                <span>No ( Cancel )</span>
              </a>
            </p>
          </div>
        </div>
      </article>
    </div>
  </modal>
</template>

<script>
import { Modal } from 'vue-bulma-modal'

export default {
  components: {
    Modal
  },

  props: {
    domain: String,
    visible: Boolean,
    title: String,
    info: String
  },

  methods: {
    close () {
      this.$emit('close')
    },
    confirmed () {
      this.$emit('confirmed')
    }
  }
}
</script>

<style scoped>
  .float-right {
    float: right;
  }
  .right-m {
    margin-right: 30px;
  }
</style>
