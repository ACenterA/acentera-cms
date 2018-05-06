<template>
  <!-- Home -->
  <div class="content has-text-centered">
    <div v-if="!isLoaded">
    </div>

    <div v-if="isLoaded">
        <div v-if="isWebsite">
          <!-- For Each Websites -->
          <div v-if="project && project.websites">
              <div v-if="selectedWebsite">

                <article class="tile is-child box scrollable floatleft fullw">
                    <h1 class="is-title is-bold">{{ pkg.name.replace('-', ' ').replace('CMS', ' CMS') }}</h1>

                    <p>
                      <strong>{{ pkg.description }}</strong>
                    </p>

                    <br/>
                    <h4 class="is-title">Selected website: <br/>{{selectedWebsite.title}}</h4>

                    <div v-if="isRepoUpdating()">
                      <p>Please wait, we are trying to gather latest updates on your website...</p>
                    </div>

                    <div v-if="isRepoUpdated()">
                      <p>Start designing and adding content to your website by using the left toolbar in the design section.</p>
                      <p>Add blog content using the Blog menu item.</p>
                    </div>

                    <div v-if="isRepoMissing()">
                      <p>There is an error with your repository configuration. We could not sync from it</p>
                    </div>

                    <br/>

                    <div v-if="repoUrl">
                      <br/>
                      Your current Repository Informations: <br/><br/>
                      <div v-if="repoUrl !== 'hidden'">Repository: {{ repoUrl }}<br/></div>
                      Branch: {{ repoState.Branch }}
                      <br/>
                    </div>

                    <br/>
                </article>

                <article class="tile is-child box scrollable floatleft marginpad fullw">
                    <h3 class="is-title is-bold">Website Informations</h3>

                    <div>
                      <label class="label floatleft">Website Live Url</label><br/>
                      <br/>
                      <div class="field has-addons floatleft fullwidth">
                        <p class="control is-expanded">
                          <input class="fullwidth" type="text" v-model="websitePublicUrl" readonly/>
                        </p>
                      </div>
                    </div>
                    <br/>&nbsp;<br/>
                    <div class="button button-site is-primary is-outlined nav-item" @click="gotoWebsite()">
                      View Website
                    </div>
                    <br/>
                    <br/>
                </article>
                <article class="tile is-child box scrollable floatleft marginpad fullw">
                    <h3 class="is-title is-bold">Share your preview</h3>

                    <div>
                      <label class="label floatleft">Website Preview Url</label><br/>
                      <br/>
                      <div class="field has-addons floatleft fullwidth">
                        <p class="control is-expanded">
                          <input class="fullwidth" type="text" v-model="websiteUrl" readonly/>
                        </p>
                      </div>
                    </div>
                    <br/>
                    <br/>
                    <div>
                      <label class="label floatleft">Code</label><br/>
                      <br/>
                      <div class="field has-addons floatleft fullwidth">
                        <p class="control is-expanded">
                          <input class="fullwidth" type="text" v-model="selectedWebsite.code" readonly/>
                        </p>
                      </div>
                    </div>
                    <br/>
                    <br/>
                    <i>Since you are logged in, you will not be asked the preview code</i>
                    <br/><br/>
                    <div class="button button-site is-primary is-outlined nav-item" @click="gotoPreviewWebsite()">
                      View Website Preview
                    </div>
                </article>

              </div>


              <div v-else="selectedWebsite">
                <div class="box box-template" v-for="item in project.websites"  style="min-height:300px; height:auto;">
                  <div class="template-thumbnails">
                      {{ item.title }}
                      <div class=""
                            style="height: 100%; width: auto; border-width: 8px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-left-style: initial; border-top-color: white; border-right-color: white; border-bottom-color: white; border-left-color: initial; border-image: initial; background-image: url(&quot;https://storage.googleapis.com/xxx/site-500426/800x500.jpg?1491902023&quot;); position: relative; right: 2%;">
                            <!-- <img v-if="item.Repository" :src="item.Repository + 'raw/master/images/screenshot.png'" class="mw-100"> -->
                            <img :src="'https://github.com/jweslley/hugo-conference/' + item.websiteId + '/thumbnails.png'" class="mw-100">
                      </div>
                      <div class="width-full">
                        <div class="float-right width-50 small-leftmargin">
                            <!--
                            <div class="button button-site is-primary is-outlined nav-item is-hidden-mobile" @click="preview(item)">
                              Preview
                            </div>
                            -->
                        </div>
                        <div class="float-right width-50 small-leftmargin">
                            <div class="button button-site is-primary is-outlined nav-item" @click="selectWebsite(item)">
                              Select
                            </div>
                        </div>
                      </div>
                  </div>
                </div>


                <br/>
                <div class="box box-template" style="min-height:300px; height:auto;">
                  <div class="template-thumbnails">
                      Add new Website
                      <div class="" style="height: 100%; width: auto; border-width: 8px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-left-style: initial; border-top-color: white; border-right-color: white; border-bottom-color: white; border-left-color: initial; border-image: initial; background-image: url(&quot;https://storage.googleapis.com/xxx/site-500426/800x500.jpg?1491902023&quot;); position: relative; right: 2%;">
                        <img class="mw-100"/>
                        Do not hesitate.  Start building a <br/> new website at no extra cost.
                      </div>
                      <div class="width-full">
                        <div class="float-right width-50 small-leftmargin">
                          <router-link :to="{name: 'Templates'}">
                            <div class="button button-site is-primary is-outlined nav-item is-hidden-mobile">
                                <span>Create your website</span>
                            </div>
                          </router-link>
                        </div>
                      </div>
                  </div>
                </div>
              </div>

          </div>

          <!-- No website yet... -->
          <section v-if="! ( project && project.websites )">
            <div class="">
              <nav class="box box-main">
                <div class="box-center-main">
                  <div>

                      <div class="center-text">
                          <h4 class="site-title">Welcome</h4>

                          <br/>
                          <br/>
                          It happears that you have not yet created your first AWESOME website<br/>

                          <br/>
                          <br/>
                          <br/>
                          <router-link :to="{name: 'Templates'}">
                          <div class="button button-site is-primary is-outlined nav-item">
                              <span>Create your website</span>
                          </div>
                          </router-link>
                      </div>
                  </div>
                </div>
              </nav>
            </div>
          </section>

    <!--
          <section class="">
            <div class="">
              <nav class="box">
                <div class="box-left">
                  <div>
                  <div class="imageloader loaded site-details--thumbnail desktop"
                  style="height: 100%; width: auto; border-width: 8px 0px; border-top-style: solid; border-right-style: solid; border-bottom-style: solid; border-left-style: initial; border-top-color: white; border-right-color: white; border-bottom-color: white; border-left-color: initial; border-image: initial; background-image: url(&quot;https://storage.googleapis.com/xxx/site-500426/800x500.jpg?1491902023&quot;); position: relative; right: 2%;">
                    <img src="https://storage.googleapis.com/xxx/site-500426/800x500.jpg?1491902023" class="mw-100"
                  ></div>
                  </div>
                </div>
                <div class="line">&nbsp;</div>
                <div class="box-center">
                  <div>
                    <div class="col-md-8 col-sm-12"><div class="site-details--content">
                      <div class="site-details--content--header clearfix">
                        <div class="float-left">
                          <h4 class="site-title">mytestsite03</h4>
                          <span class="status--subscription-status"><span class="status--subscription-status published">Published</span>
                        </span>
                      </span>
                    </div>
                    </div>
                    </div>
                    </div>
                  </div>
                </div>
                <div class="box-right">
                  <div>
                      <div class="button button-site is-primary is-outlined nav-item is-hidden-mobile">
                          <span>Edit site</span>
                      </div>
                  </div>
                </div>
              </nav>
            </div>
          </section>
    -->

        </div>
        <div v-else>
          <h1 class="is-title is-bold">{{ pkg.name.replace('-', ' ').replace('CMS', ' CMS') }}</h1>

          <p>
            <strong>{{ pkg.description }}</strong>
          </p>

          <div v-if="isRepoUpdating()">
            <p>Please wait, we are trying to gather latest updates on your website...</p>
          </div>

          <div v-if="isRepoUpdated()">
            <p>Start designing and adding content to your website by using the left toolbar in the design section.</p>
            <p>Select new theme, without code changes</p>
          </div>
          <div v-if="isRepoMissing()">
            <p>There is an error with your repository. You do not have a .git/config file.</p>
          </div>

          <br/>
          <div v-if="repoUrl">
            <br/>
            Your current Repository Informations: <br/><br/>
            Repository: {{ repoUrl }}
            <br/>
            Branch: {{ repoState.Branch }}
            <br/>
          </div>

          <div v-if="isKeyMissing()">
            <br/>
            <p class="blue">SSH Key is missing. &nbsp;<router-link to="/login" :exact="true"><b>Click here to configure.</b></router-link></p>
          </div>
        </div>
      </div>

  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
// import Vue from 'vue'

export default {

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
      isWebsite: 'isWebsite',
      selectedWebsite: 'selectedWebsite',
      selectedProject: 'selectedProject'
    }),
    websitePublicUrl: function () {
      if (this.selectedWebsite && this.selectedWebsite.domains) {
        for (var v in this.selectedWebsite.domains) {
          if (this.selectedWebsite.domains.hasOwnProperty(v)) {
            var dom = this.selectedWebsite.domains[v]
            if (dom.primary) {
              return 'https://' + v
            }
          }
        }
        return window.goHostUrl.replace('.workspace.acentera.com', '.web.acentera.com')
      } else {
        return window.goHostUrl.replace('.workspace.acentera.com', '.web.acentera.com')
      }
    },
    websiteUrl: function () {
      return window.goHostUrl
    },
    isLoaded: function () {
      return this.$store.state.app.isLoaded
    },
    project: function () {
      return this.selectedProject
    },
    repoState: function () {
      return this.$store.state.app.repoState
    },
    repoUrl: function () {
      if (this.$store.state.app.repoState.hasOwnProperty('url')) {
        if (this.$store.state.app.repoState.hasOwnProperty('url') !== undefined && this.$store.state.app.repoState.hasOwnProperty('url') !== null && this.$store.state.app.repoState.hasOwnProperty('url') !== '') {
          // if (this.$store.state.app.repoState.url === 'hidden') {
          //  return ''
          // }
          return this.$store.state.app.repoState.url
        }
      }
    }
  },
  mounted () {
  },
  methods: {
    ...mapActions([
      'toggleRepoState',
      'toggleRepo',
      'toggleRepoUrl',
      'selectWebsite',
      'refreshUser'
    ]),
    gotoWebsite () {
      window.open(this.websitePublicUrl, '_blank')
    },
    gotoPreviewWebsite () {
      window.open(window.goHostUrl, '_blank')
    },
    isRepoUpdating () {
      return (this.repoState.updating === 1)
    },
    isRepoUpdated () {
      return (this.repoState.updating === 0)
    },
    isRepoMissing () {
      return (this.repoState.updating === 5)
    },
    isKeyMissing () {
      return (this.repoState.updating === 6)
    },
    preview: (item) => {
    },
    select: (item) => {
      window.vm.$store.commit('SELECT_WEBSITE', item.projectId, item.websiteId, window.vm.$store.getters.session)
    }
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
