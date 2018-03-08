<template>
  <modal :visible="visible" @close="close">
    <div class="box">
      <article class="media">
        <div class="media-content">
          <div class="content">
            <p>
              We have to validate the domain <b>{{ domain }}</b> belongs to you.
              <br/>
              You need to add the following CNAME record on your current DNS provider to redirect your end-user to your new website.
              <br/>
              Create the following CNAME record on <b>{{ domain }}</b><br/><br/>
              <strong>{{ fullDomain }}.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;CNAME&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;websites.acentera.com</strong>
              <br/>
              <i>Note: it may takes few minutes epending on your current configuration. If your site is currently SSL, you should contact us to garantee the accessibility of your website.</i>
              <div v-if="error" class="is-danger">
                {{ error }}
              </div>
              <br>
              <a class="button is-primary float-right" @click="confirmed">
                <span>Validate</span>
                <span class="icon">
                  <!-- <i class="fa fa"></i> -->
                </span>
              </a>
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
