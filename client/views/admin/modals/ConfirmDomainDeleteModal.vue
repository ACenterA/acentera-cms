<template>
  <modal :visible="visible" @close="close">
    <div class="box">
      <article class="media">
        <div class="media-content">
          <div class="content">
            <p>
              Are you sure you want to modify your current website configuration ?
              <br/>
              <br/>
              This will delete <b>{{ domain }}</b> <br/>
              <br/>
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
