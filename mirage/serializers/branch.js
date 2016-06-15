import { Serializer } from 'ember-cli-mirage';

import BuildSerializer from './build';

export default Serializer.extend({
  serialize(object, request) {
    return {
      '@type': 'branches',
      branches: object.models.map(branch => {
        const builds = branch.builds;

        if (branch.builds && branch.builds.models.length) {
          const lastBuild = branch.builds.models[builds.models.length - 1];

          branch.attrs.last_build = new BuildSerializer().serialize(lastBuild, request);
        }

        return branch.attrs;
      }),
      pagination: {
        count: object.length
      }
    };
  }
});
