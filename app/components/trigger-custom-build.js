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
    let body = {
      request: {
        branch: this.get('triggerBuildBranch')
      }
    };

    try {
      yield this.get('ajax').postV3(`/repo/${this.get('repo.id')}/requests`, body)
        .then((data) => {
          this.get('flashes')
            .success('You triggered a build! We\'re waiting to see if the request got through.');

          let reqId = data.request.id;
          Ember.run.later(this, function () {
            this.get('ajax')
              .ajax(`/repo/${this.get('repo.id')}/request/${reqId}`, 'GET',
                    { headers: { 'Travis-API-Version': '3' } })
              .then((data) => {
                let reqResult = data.result;

                if (reqResult === 'approved') {
                  this.get('flashes')
                    .success(`Your request was ${reqResult}.`);
                } else {
                  this.get('flashes')
                    .error(`Your request was ${reqResult}.`);
                }
              });
          },  1000);

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
