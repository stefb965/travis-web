import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    triggerCustomBuild() {
      console.log('TRIGGER');
    }
  }
});
