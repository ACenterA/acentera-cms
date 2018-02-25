<template>
  <modal :visible="visible" @close="close">
      <div class="tile is-ancestor box is-vertical" style='min-height:330px'>
        <div class="tile">

          <!-- Left side -->
          <div class="column is-12">
            <div class="column is-6">
              <p class="control" style="right:50px; right;position:absolute;">
                <a v-if="isBitBucket" class="button is-warning leftfloat" title="Sign out from BitBucket"
                  @click="closeAndLogout()">
                    <span>Logout from BitBucket</span>
                  </a>
                <a v-if="isGithub" class="button is-warning leftfloat" title="Sign out from GitHub"
                  @click="closeAndLogout()">
                  <span>Logout from Github</span>
                </a>
                <a class="button leftfloat" title="Close and choose another template"
                  @click="close()">
                  <span>Close</span>
                </a>
              </p>
            </div>
            Your almost there!
            <br/>
            Simply name your website.
            <br/>

            <article class="tile is-parent is-12 is-vertical">
              <!-- Login tile -->
              <article class="tile is-child is-marginless is-paddingless plekan-editor-arena">
                <div class="plekan-editable-element-fields-container">
                  <div class="plekan-editable-element-fields">
                    <span>Website Title</span>
                    <input type="text" v-model="websiteTitle" placeholder="The Blog of John Doe">
                  </div>
                </div>

                <div class="plekan-editable-element-fields-container">
                  <div class="plekan-editable-element-fields">
                    <span>Project name</span>
                    <input type="text" v-model="websiteProjectName" @input="websiteProjectNameValidator()" :placeholder="websiteShortPlaceholder">
                  </div>
                </div>
                <div class="plekan-editable-element-fields-container">
                  <div class="plekan-editable-element-fields">
                    <span>Repo. Name</span>
                    <input type="text" v-model="repositoryName" @input="repositoryNameValidator()" :placeholder="shortName">
                  </div>
                </div>

                <div class="column is-6">
                  <p class="control" style="right:50px; right;position:absolute;">
                    <a v-if="!processing" :disabled="disabled" class="button is-primary leftfloat" title="Create my website" @click="nextStep()">
                      <span>Create</span>
                    </a>
                    <a v-else :disabled="disabled" class="button leftfloat" title="Creating..">
                      <span>Creating...</span>
                    </a>
                  </p>
                </div>

              </article>
            </article>
          </div>
        </div>
     </div>
  </modal>
</template>

<script>
import { Modal } from 'vue-bulma-modal'
import { mapGetters, mapActions } from 'vuex'

export default {
  components: {
    Modal
  },
  props: {
    visible: Boolean,
    title: String,
    template: Object,
    info: String
  },
  data () {
    return {
      csrf: '',
      type: 'Token',
      processing: false,
      ID: '',
      websiteTitle: '',
      websiteProjectName: null,
      disabled: false,
      repositoryName: '',
      pubKey: '',
      Password: '',
      healthData: {},
      sshValid: true,
      sshKeyCreateError: false,
      healthLoading: false
    }
  },

  mounted: function () {
  },

  computed: {
    ...mapGetters({
      session: 'session',
      repoState: 'repoState',
      github: 'github'
    }),
    isBitBucket () {
      try {
        var gitInfo = this.github
        return (gitInfo.logininfo.type === 'BitBucket')
      } catch (e) {
      }
      return false
    },
    isGithub () {
      try {
        var gitInfo = this.github
        return (!(gitInfo.logininfo.type === 'BitBucket')) // TODO Should check for GitHub
        // return (this.$store.state.github.logininfo.type !== 'BitBucket')
      } catch (e) {
      }
      return false
    },
    websiteShortPlaceholder () {
      var result = this.websiteTitle.replace(/[^a-zA-Z0-9\s]/g, '') // Remove non alphanum except whitespace
             .replace(/^\s+|\s+$/, '')      // Remove leading and trailing whitespace
             .replace(/\s+/g, ' ')          // Replace (multiple) whitespaces with a dash
             .toLowerCase()
      return result
    },
    shortName () {
      var result = (this.websiteProjectName || this.websiteShortPlaceholder).replace(/[^a-zA-Z0-9\-\s]/g, '') // Remove non alphanum except whitespace
             .replace(/--+/, '-')
             .replace(/^\s+|\s+$/, ' ')      // Remove leading and trailing whitespace
             .replace(/\s+/g, '-')          // Replace (multiple) whitespaces with a dash
             .replace(/-$/, '')
             .replace(/-$/, '')
             .replace(/-$/, '')
             .toLowerCase()
      return result
    }
  },

  methods: {
    ...mapActions([
      'toggleRepoState'
    ]),
    websiteProjectNameValidator () {
      try {
        var result = this.websiteProjectName.replace(/[^a-zA-Z0-9\-\s]/g, '') // Remove non alphanum except whitespace
               .replace(/--+/, '-')
               .replace(/^\s+|\s+$/, ' ')      // Remove leading and trailing whitespace
               .replace(/\s+/g, '-')          // Replace (multiple) whitespaces with a dash
               .toLowerCase()
        // this.websiteProjectName = result
        return result
      } catch (ff) {
      }
    },
    repositoryNameValidator () {
      try {
        var result = (this.repositoryName || this.shortName).replace(/[^a-zA-Z0-9\-\s]/g, '') // Remove non alphanum except whitespace
               .replace(/--+/, '-')
               .replace(/^\s+|\s+$/, ' ')      // Remove leading and trailing whitespace
               .replace(/\s+/g, '-')          // Replace (multiple) whitespaces with a dash
               .toLowerCase()
        this.repositoryName = result
        return result
      } catch (ff) {
      }
    },
    closeAndLogout () {
      window.localStorage.setItem('github', JSON.stringify({}))
      this.$store.commit('setGit', {})
      this.$emit('close')
    },
    close () {
      this.$emit('close')
    },
    gitError: function (e) {
      if (e.toString().indexOf('code 401')) {
        // Invalid user
      }
      this.processing = false
    },
    gitDeleteRepoError: function (e) {
      if (e.toString().indexOf('code 401')) {
        // Invalid user
      }

      this.processing = false
    },
    nextStep () {
      var self = this

      this.processing = true
      var userPostPath = 'user/repos'
      var $gitobj = this.$github

      var gitInfo = this.github
      var repoReqObj = {
        'name': self.repositoryNameValidator(),
        'description': self.websiteProjectName || 'Website generated from ACenterA CMS (https://ACenterA.com)'
      }

      if (gitInfo.logininfo.type === 'BitBucket') {
        $gitobj = this.$bitbucket
        userPostPath = '2.0/repositories/' + gitInfo.logininfo.username + '/' + self.repositoryNameValidator()
        repoReqObj = {
          scm: 'git',
          fork_policy: 'no_public_forks',
          description: self.websiteProjectName || 'Website generated from ACenterA CMS (https://ACenterA.com)',
          is_private: true
        }
      }

      if (window.vueAuth.getToken()) {
        // validate if window.vueAuth.getToken() is same as this.$store.state.github.logininfo.token ??
        $gitobj.setToken(window.vueAuth.getToken())
      } else {
        $gitobj.setUserPass(gitInfo.logininfo.username, gitInfo.logininfo.pass)
      }

      $gitobj.post(userPostPath, repoReqObj, function (response) {
        var next = response.data
        // self.sendDeleteRepo()
        /*
          // if bitbucket:
             To get Response : /2.0/repositories/{username}/{repo_slug}
          // create received the following
        { "scm": "git",
         "website": "",
         "has_wiki": false,
         "name": "my-first-blog-of-theace",
         "links": {"watchers": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/my-first-blog-of-theace/watchers"}, "branches": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/my-first-blog-of-theace/refs/branches"}, "tags": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/my-first-blog-of-theace/refs/tags"}, "commits": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/my-first-blog-of-theace/commits"},
         "clone": [{"href": "https://Gizmodo1@bitbucket.org/Gizmodo1/my-first-blog-of-theace.git", "name": "https"}, {"href": "git@bitbucket.org:Gizmodo1/my-first-blog-of-theace.git", "name": "ssh"}],
          "self": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/my-first-blog-of-theace"}, "source": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/my-first-blog-of-theace/src"}, "html": {"href": "https://bitbucket.org/Gizmodo1/my-first-blog-of-theace"}, "avatar": {"href": "https://bitbucket.org/Gizmodo1/my-first-blog-of-theace/avatar/32/"}, "hooks": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/my-first-blog-of-theace/hooks"}, "forks": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/my-first-blog-of-theace/forks"}, "downloads": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/my-first-blog-of-theace/downloads"}, "pullrequests": {"href": "https://api.bitbucket.org/2.0/repositories/Gizmodo1/my-first-blog-of-theace/pullrequests"}}, "fork_policy": "no_public_forks", "uuid": "{5e3ed638-c3ec-4f7f-82eb-7746c6a60585}", "language": "", "created_on": "2017-11-17T02:22:33.165666+00:00", "mainbranch": null, "full_name": "Gizmodo1/my-first-blog-of-theace", "has_issues": false, "owner": {"username": "Gizmodo1", "display_name": "francis Lavalliere", "type": "user", "uuid": "{d1f483aa-fb4b-4a10-b7df-e58bd6a7500f}", "links": {"self": {"href": "https://api.bitbucket.org/2.0/users/Gizmodo1"}, "html": {"href": "https://bitbucket.org/Gizmodo1/"}, "avatar": {"href": "https://bitbucket.org/account/Gizmodo1/avatar/32/"}}}, "updated_on": "2017-11-17T02:22:33.218317+00:00", "size": 0, "type": "repository", "slug": "my-first-blog-of-theace", "is_private": true, "description": "Static website created from ACenterA.com"}
        */

        var theRepoId = null
        var repositoryUrl = null
        var sshUrl = null
        var httpUrl = null
        var branch = 'master'
        var repoDetail = {}
        if (next.id !== undefined) {
          // github
          theRepoId = next.id
          repositoryUrl = next.url
          sshUrl = next.ssh_url
          httpUrl = next.clone_url
          branch = next.default_branch
          repoDetail['id'] = theRepoId
          repoDetail['name'] = next.name
        } else if (next.uuid !== undefined) {
          // bit BitBucketAPI
          theRepoId = next.uuid
          theRepoId = theRepoId.replace('{', '').replace('}', '')
          repositoryUrl = next.links.self.href

          for (var cloneItem in next.links.clone) {
            if (next.links.clone[cloneItem].name === 'ssh') {
              sshUrl = next.links.clone[cloneItem].href
            }
            if (next.links.clone[cloneItem].name === 'https') {
              httpUrl = next.links.clone[cloneItem].href
            }
          }

          // Remove the username we use AUTH...
          if (httpUrl.indexOf('@') >= 0) {
            httpUrl = 'https://' + httpUrl.substring(httpUrl.indexOf('@') + 1)
          }

          branch = next.mainbranch || 'master'
          repoDetail['uuid'] = theRepoId
          repoDetail['name'] = next.name
        }

        if (branch === null || branch === 'undefined') {
          branch = 'master'
        }
        httpUrl = httpUrl.replace(/\.git$/, '')
        sshUrl = sshUrl.replace(/git@/, '') // should we allow git username and fix the azure cli instead??

        var projectId = null
        if (self.$store.state.app.project) {
          projectId = self.$store.state.app.project.projectId
        }

        // NOTE: Cannot use 'authorization' as its will bypass the header value for authorization ...
        var initSite = {
          'projectId': projectId,
          'repository': repositoryUrl,
          'ssh_repository': sshUrl,
          'auth': $gitobj.getBasicAuth(),
          'token': window.vueAuth.getToken(),
          'http_repository': httpUrl,
          'refresh': window.vueAuth.getRefreshToken(),
          'branch': 'master',
          'title': self.websiteTitle,
          'repodetails': repoDetail,
          'theme': 'hugo-agency-theme',
          'template_repo': self.template.Repository, // 'https://github.com/FLavalliere/my-first-blog',
          'template_branch': 'master'
        }

        var initSiteRepoCall = window.websiteapiUrl + '/sites/v1/websites/create'

        self.toggleRepoState(0) // Reset state for creating, to disable any messages... until it got created.
        self.$store.state.app.websiteInCreationMode = true // prevent navbar messages
        var rollback = function (extra) {
          self.$store.state.app.websiteInCreationMode = false
          self.$notify({
            title: 'Cannot create repository.',
            message: 'We were unable to create your repository. Contact support. ' + extra,
            type: 'danger'
          })

          var userDelPath = 'repos/' + gitInfo.logininfo.username + '/' + self.repositoryNameValidator()

          if (gitInfo.logininfo.type === 'BitBucket') {
            $gitobj = self.$bitbucket
            userDelPath = '2.0/repositories/' + gitInfo.logininfo.username + '/' + self.repositoryNameValidator()
          }

          $gitobj.delete(userDelPath, function (next) {
            self.processing = false
          }, self.gitDeleteRepoError)
        }
        // self.$store.state.session might be null if its not the website app but the local version..
        var h = { 'authorization': 'Bearer ' + self.$store.state.session.token }
        self.$http.post(initSiteRepoCall, initSite, {
          headers: h
        }).then((response) => {
          if (!(response.data.type.startsWith('error'))) {
            self.processing = false
            self.$emit('changePage', response.data)
          } else {
            rollback(response.data.type)
          }
        }, function (errr) {
          rollback('Cannot connect to api server')
        })

        /*
          // if github:
          Create response give the JSON Below.. and to GET it curl 'https://api.github.com/repos/FLavalliere/my-first-blog'
          {
            "id": 111046372,
            "name": "my-first-blog",
            "full_name": "FLavalliere/my-first-blog",
            "owner": {
              "login": "FLavalliere",
              "id": 7669747,
              "avatar_url": "https://avatars2.githubusercontent.com/u/7669747?v=4",
              "gravatar_id": "",
              "url": "https://api.github.com/users/FLavalliere",
              "html_url": "https://github.com/FLavalliere",
              "followers_url": "https://api.github.com/users/FLavalliere/followers",
              "following_url": "https://api.github.com/users/FLavalliere/following{/other_user}",
              "gists_url": "https://api.github.com/users/FLavalliere/gists{/gist_id}",
              "starred_url": "https://api.github.com/users/FLavalliere/starred{/owner}{/repo}",
              "subscriptions_url": "https://api.github.com/users/FLavalliere/subscriptions",
              "organizations_url": "https://api.github.com/users/FLavalliere/orgs",
              "repos_url": "https://api.github.com/users/FLavalliere/repos",
              "events_url": "https://api.github.com/users/FLavalliere/events{/privacy}",
              "received_events_url": "https://api.github.com/users/FLavalliere/received_events",
              "type": "User",
              "site_admin": false
            },
            "private": false,
            "html_url": "https://github.com/FLavalliere/my-first-blog",
            "description": "Website generated from ACenterA CMS (https://ACenterA.com)",
            "fork": false,
  REPOSITORY =>           "url": "https://api.github.com/repos/FLavalliere/my-first-blog",
            "forks_url": "https://api.github.com/repos/FLavalliere/my-first-blog/forks",
            "keys_url": "https://api.github.com/repos/FLavalliere/my-first-blog/keys{/key_id}",
            "collaborators_url": "https://api.github.com/repos/FLavalliere/my-first-blog/collaborators{/collaborator}",
            "teams_url": "https://api.github.com/repos/FLavalliere/my-first-blog/teams",
            "hooks_url": "https://api.github.com/repos/FLavalliere/my-first-blog/hooks",
            "issue_events_url": "https://api.github.com/repos/FLavalliere/my-first-blog/issues/events{/number}",
            "events_url": "https://api.github.com/repos/FLavalliere/my-first-blog/events",
            "assignees_url": "https://api.github.com/repos/FLavalliere/my-first-blog/assignees{/user}",
            "branches_url": "https://api.github.com/repos/FLavalliere/my-first-blog/branches{/branch}",
            "tags_url": "https://api.github.com/repos/FLavalliere/my-first-blog/tags",
            "blobs_url": "https://api.github.com/repos/FLavalliere/my-first-blog/git/blobs{/sha}",
            "git_tags_url": "https://api.github.com/repos/FLavalliere/my-first-blog/git/tags{/sha}",
            "git_refs_url": "https://api.github.com/repos/FLavalliere/my-first-blog/git/refs{/sha}",
            "trees_url": "https://api.github.com/repos/FLavalliere/my-first-blog/git/trees{/sha}",
            "statuses_url": "https://api.github.com/repos/FLavalliere/my-first-blog/statuses/{sha}",
            "languages_url": "https://api.github.com/repos/FLavalliere/my-first-blog/languages",
            "stargazers_url": "https://api.github.com/repos/FLavalliere/my-first-blog/stargazers",
            "contributors_url": "https://api.github.com/repos/FLavalliere/my-first-blog/contributors",
            "subscribers_url": "https://api.github.com/repos/FLavalliere/my-first-blog/subscribers",
            "subscription_url": "https://api.github.com/repos/FLavalliere/my-first-blog/subscription",
            "commits_url": "https://api.github.com/repos/FLavalliere/my-first-blog/commits{/sha}",
            "git_commits_url": "https://api.github.com/repos/FLavalliere/my-first-blog/git/commits{/sha}",
            "comments_url": "https://api.github.com/repos/FLavalliere/my-first-blog/comments{/number}",
            "issue_comment_url": "https://api.github.com/repos/FLavalliere/my-first-blog/issues/comments{/number}",
            "contents_url": "https://api.github.com/repos/FLavalliere/my-first-blog/contents/{+path}",
            "compare_url": "https://api.github.com/repos/FLavalliere/my-first-blog/compare/{base}...{head}",
            "merges_url": "https://api.github.com/repos/FLavalliere/my-first-blog/merges",
            "archive_url": "https://api.github.com/repos/FLavalliere/my-first-blog/{archive_format}{/ref}",
            "downloads_url": "https://api.github.com/repos/FLavalliere/my-first-blog/downloads",
            "issues_url": "https://api.github.com/repos/FLavalliere/my-first-blog/issues{/number}",
            "pulls_url": "https://api.github.com/repos/FLavalliere/my-first-blog/pulls{/number}",
            "milestones_url": "https://api.github.com/repos/FLavalliere/my-first-blog/milestones{/number}",
            "notifications_url": "https://api.github.com/repos/FLavalliere/my-first-blog/notifications{?since,all,participating}",
            "labels_url": "https://api.github.com/repos/FLavalliere/my-first-blog/labels{/name}",
            "releases_url": "https://api.github.com/repos/FLavalliere/my-first-blog/releases{/id}",
            "deployments_url": "https://api.github.com/repos/FLavalliere/my-first-blog/deployments",
            "created_at": "2017-11-17T02:15:08Z",
            "updated_at": "2017-11-17T02:15:08Z",
            "pushed_at": "2017-11-17T02:15:08Z",
            "git_url": "git://github.com/FLavalliere/my-first-blog.git",
    ssh_repository remove the git@ -->        "ssh_url": "git@github.com:FLavalliere/my-first-blog.git",
            "clone_url": "https://github.com/FLavalliere/my-first-blog.git",
            "svn_url": "https://github.com/FLavalliere/my-first-blog",
            "homepage": null,
            "size": 0,
            "stargazers_count": 0,
            "watchers_count": 0,
            "language": null,
            "has_issues": true,
            "has_projects": true,
            "has_downloads": true,
            "has_wiki": true,
            "has_pages": false,
            "forks_count": 0,
            "mirror_url": null,
            "archived": false,
            "open_issues_count": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
   branch =>          "default_branch": "master",
            "permissions": {
              "admin": true,
              "push": true,
              "pull": true
            },
            "allow_squash_merge": true,
            "allow_merge_commit": true,
            "allow_rebase_merge": true,
            "network_count": 0,
            "subscribers_count": 1
          }
        */
      }, self.gitError)
    },
    sendDeleteRepo () {
      // in the event that we created it, but something failed when trying to build it...
      var self = this
      this.processing = true
      // ensure to use login credentials first...

      var userPostPath = 'user/repos' // api/v3/users/' + this.$store.state.github.logininfo.username + '/' + 'repos' + '/' + self.repositoryNameValidator()
      var $gitobj = this.$github
      // curl -H "Authorization: token xxx" https://github.COMPANY_NAME.com/api/v3/users/USER/repos

      if (this.$store.state.github.logininfo.type === 'BitBucket') {
        $gitobj = this.$bitbucket
        userPostPath = '2.0/repositories/' + this.$store.state.github.logininfo.username + '/' + self.repositoryNameValidator()
      }
      if (window.vueAuth.getToken()) {
        // validate if window.vueAuth.getToken() is same as this.$store.state.github.logininfo.token ??
        $gitobj.setToken(window.vueAuth.getToken())
      } else {
        $gitobj.setUserPass(this.$store.state.github.logininfo.username, this.$store.state.github.logininfo.pass)
      }

      $gitobj.delete(userPostPath, function (next) {
        self.processing = false
      }, this.gitDeleteRepoError)
    }
  }
}

</script>

<style>
.modal-content {
   overflow: hidden;
 }
 .background-red {
   background-color: red;
 }
</style>
