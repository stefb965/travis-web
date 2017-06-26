import Ember from 'ember';
import { task } from 'ember-concurrency';

const { service } = Ember.inject;

export default Ember.Component.extend({
  ajax: service(),

  triggerBuildMessage: '',
  triggerBuildConfig: '',
  triggerBuildBranch: '',

  afterTriggerState: false,
  triggeredBuildId: false,

  sendTriggerRequest: task(function* () {
    let body = {
      request: {
        branch: this.get('triggerBuildBranch')
      }
    };

    try {
      yield this.get('ajax').postV3(`/repo/${this.get('repo.id')}/requests`, body)
        .then((data) => {
          this.set('afterTriggerStatus', `Build request was sent, waiting to hear back.`);

          let reqId = data.request.id;
          Ember.run.later(this, function () {
            this.get('ajax')
              .ajax(`/repo/${this.get('repo.id')}/request/${reqId}`, 'GET',
                    { headers: { 'Travis-API-Version': '3' } })
              .then((data) => {
                let reqResult = data.result;
                let triggeredBuild = data.builds[0];

                if (reqResult === 'approved') {
                  this.set('afterTriggerStatus', `Your request was ${reqResult}.`);
                  this.set('triggeredBuildId', triggeredBuild.id);
                } else if (reqResult === 'rejected') {
                  this.set('afterTriggerStatus', `Your request was ${reqResult}. Please see the Request tab for more information.`);
                } else { // pending etc
                  this.set('afterTriggerStatus', `Your request was not ready yet. Please see the Request tab for more information.`);
                }

                Ember.run.later(this, this.get('onClose'), 3000);
              });
          }, 2000);
        });
    } catch (e) {
      this.set('afterTriggerStatus', `Your build request did not get through. Please try again later`);
      Ember.run.later(this, this.get('onClose'), 3000);
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
