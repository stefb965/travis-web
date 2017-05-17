import Ember from 'ember';
import { task } from 'ember-concurrency';

const { service } = Ember.inject;

export default Ember.Component.extend({
  ajax: service(),
  flashes: service(),

  triggerBuildMessage: '',
  triggerBuildConfig: '',
  triggerBuildBranch: '',

  sendTriggerRequest: task(function* () {
    let body = {};
    body.request = {};

    if (this.get('triggerBuildMessage') !== '') {
      body.request.message = this.get('triggerBuildMessage');
    }
    if (this.get('triggerBuildConfig') !== '') {
      body.request.config = this.get('triggerBuildConfig');
    }
    if (this.get('triggerBuildBranch') !== '') {
      body.request.branch = this.get('triggerBuildBranch');
    }

    body.request = JSON.stringify(body.request);

    try {
      yield this.get('ajax').postV3(`/repo/${this.get('repo.id')}/requests`, body)
        .then(() => {
          this.get('flashes')
            .success('We received the request, your build is being created');
          this.get('onClose')();
        });
    } catch (e) {
      this.get('flashes')
        .error('There was an error with the build requets, it did not get through');
      this.get('onClose')();
    }
  }),

  actions: {
    triggerCustomBuild() {
      this.get('sendTriggerRequest').perform();
    },
    toggleTriggerBuildModal() {
      this.get('onClose')();
    }
  }
});
