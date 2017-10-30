<template>
  <modal :visible="visible" @close="close">

    <div class="box">
      <button class="btnNoPad rightfloat" @click="cancel">Cancel</button>
      <article class="media">
        <div class="media-content">
          <div class="content">
            <p>
              <strong>{{ title }}</strong>
              <br/>Last Update: {{ updated_on }}
              <br/>
              <br/>
              <br>{{ desc }}
            </p>
          </div>
        </div>
      </article>
      <button class="btnNoPad rightfloat" @click="select">Select this Version</button>
    </div>
  </modal>
</template>

<style>
.content {
   min-height: 350px;
}

.box {
  min-height: 400px;
}

.btnNoPad {
  width: 29%;
}

.btn {
  width: 29%;
  margin:30px;
}

.rightfloat {
  float: right;
}

</style>

<script>
import { Modal } from 'vue-bulma-modal'

export default {
  components: {
    Modal
  },

  props: {
    visible: Boolean,
    title: String,
    commit: String,
    updated_on: String,
    desc: String,
    branch: String
  },

  methods: {
    close () {
      this.$emit('close')
    },
    select () {
      this.$emit('select', { branch: this.branch, commit: this.commit })
    },
    cancel () {
      this.close()
    }
  }
}
</script>
