<template>
  <!-- PW Reset -->

  <div class="content has-text-centered">
    <div v-if="!isLoaded">
    </div>

    <div v-if="isLoaded">
        Password reset here
    </div>
  </div>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
  },
  data () {
    return {
      pkg: this.$store.state.pkg,
      getVueObj: function () {
        return this
      }
    }
  },
  computed: {
    ...mapGetters({
    })
  },
  mounted () {
  },
  methods: {
    ...mapActions([
    ])
  }

}
</script>


<style lang="scss" scoped>

@import '~bulma/sass/utilities/variables';

.floatleft {
  float: left;
}
.marginpad {
  margin-left:30px!important;
}
.fullw {
  width: 45%;
  margin-top: 30px!important;
}
.fullwidth {
  width: 100%;
}

.is-title {
  text-transform: capitalize;
}
.box {
  min-height:120px;
  display: inline-block;
}

.box-left {
    float: left;
    height:100%;
    // margin-right:50px;
    width:40%;
    -webkit-overflow-scrolling: touch;
    -ms-flex-align: stretch;
    align-items: stretch;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-positive: 1;
    flex-grow: 1;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    max-width: 100%;
    overflow: auto;
    justify-content: flex-start;
    white-space: nowrap;
    -ms-flex-pack: start;
}

.box-right {

    -webkit-overflow-scrolling: touch;
    -ms-flex-align: stretch;
    align-items: stretch;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-positive: 1;
    flex-grow: 1;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    max-width: 100%;
    overflow: auto;
    -ms-flex-pack: end;
    justify-content: flex-end;
}

.background-box {
  background-color: white;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  color: #4a4a4a;
  display: block;
  padding: 1.25rem;
  width: 20%;
}

.width-50 {
  // width: 30%;
  width: 100%;
}

.small-leftmargin {
  margin-left:30px;
}


.width-full {
  width: 100%;
  display: inline-flex;
}

.line {
  height: 100%;
  position: relative;
  float: left;
  height: auto;
  border-left: 1px solid #efefef;
  height: 100%;
}

.box-template {
  width:25%;
  margin-left:30px;
}

.template-thumbnails {
   width:100%;
}

.mw-100 {
  min-height:190px;
}

.box-center-main {
  width:100%;
  padding-left:10px;
  float: left;
  -ms-flex-align: stretch;
  align-items: stretch;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-positive: 0;
  flex-grow: 0;
  -ms-flex-negative: 0;
  flex-shrink: 0;
  -ms-flex-pack: center;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
}
.box-center {
    padding-left:10px;
    float: left;
    -ms-flex-align: stretch;
    align-items: stretch;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-positive: 0;
    flex-grow: 0;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    -ms-flex-pack: center;
    justify-content: center;
    margin-left: auto;
    margin-right: auto;
}

.button-site {
  min-width:100px;
}

.float-left {
  float:left;
}

.center-text-template {
  position: relative;
  text-align: center;
  display: inline-block; /* changed this line */
  // color: white;
  // text-shadow: 0 1px 5px grey;
  clear: both;
}
.center-text {
    position: relative;
    top: 50%;
    display: inline;
    left: 50%; /* added this line and changed the next four lines */
    -moz-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    text-align: center;
    display: inline-block; /* changed this line */
    // color: white;
    // text-shadow: 0 1px 5px grey;
    clear: both;
}
.box-main {
  width:80%;
  text-align:center;
}
</style>
