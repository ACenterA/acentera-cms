<template>
  <modal :visible="visible" @close="close">
    <div class="box">
      <article class="media">
        <div class="media-content">
          <div class="content">
            <p>
              We are currently updating your website SSL configuration.<br/>
              <br/>
              <br/>
              This takes a less than a minutes to complete.
              <br/>
              Please stand by.
              <br/>
              <br/>
              <a class="button is-warning float-right right-m" @click="close">
                <span>Cancel</span>
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
    error: String,
    fullDomain: String,
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
