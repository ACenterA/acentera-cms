<template>
  <modal :visible="visible" @close="close">
    <div class="box">
      <article class="media">
        <div class="media-content">
          <div class="content">
            <p>
              We have to validate that you own the following domain name:
              <br/><br/>
              <b>{{ domain }}</b>
              <br/>
              <br/>
              We require a TXT DNS record on your current DNS provider.
              <br/>
              <br/>
              Create the following TXT record on <b>{{ domain }}</b><br/><br/>
              <strong>acentera-websites&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TXT&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ info }}</strong>
              <br/>
              <i>Note: it may takes few hours depending on your current configuration</i>
              <div v-if="error" class="is-danger">
                {{ error }}
              </div>
              <br/>
              <br/>
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
    info: String,
    error: String
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
  .is-danger {
    background-color: #ff3860;
    border-radius: 3px 3px 0 0;
    color: #ffffff;
    font-size: 1.25em;
    line-height: 1.25;
    padding: 0.5em 0.75em;
  }
  .float-right {
    float: right;
  }
  .right-m {
    margin-right: 30px;
  }
</style>
