import Ember from 'ember';

const { service } = Ember.inject;

export default Ember.Component.extend({
  flashes: service(),

  actions: {
    removeLog() {
      let job = this.get('job');

      this.get('onRemoveCloseModal')();

      return job.removeLog().then(() => {
        this.get('flashes').success('Log has been successfully removed.');
      }, (xhr) => {
        if (xhr.status === 409) {
          return this.get('flashes').error('Log can\'t be removed');
        } else if (xhr.status === 401) {
          return this.get('flashes').error('You don\'t have sufficient access to remove the log');
        } else {
          return this.get('flashes').error('An error occurred when removing the log');
        }
      });
    }
  }
});
