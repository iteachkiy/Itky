import { isArray, contains } from 'underscore';
import Component from '../../dom_components/model/Component';
import { CommandObject } from './CommandAbstract';

export default {
  run(ed, s, opts = {}) {
    const em = ed.getModel();
    const clp: Component[] = em.get('clipboard');
    const lastSelected = ed.getSelected();

    if (clp && lastSelected) {
      ed.getSelectedAll().forEach(selected => {
        const { collection } = selected;
        if (!collection) return;

        let added;
        const at = selected.index() + 1;
        const addOpts = { at, action: opts.action || 'paste-component' };

        if (contains(clp, selected) && selected.get('copyable')) {
          // @ts-ignore
          added = collection.add(selected.clone(), addOpts);
        } else {
          const copyable = clp.filter(cop => cop.get('copyable'));
          const pasteable = copyable.filter(cop => ed.Components.canMove(selected.parent()!, cop).result);
          added = collection.add(
            // @ts-ignore
            pasteable.map(cop => cop.clone()),
            addOpts
          );
        }

        added = isArray(added) ? added : [added];
        added.forEach(add => ed.trigger('component:paste', add));
      });

      lastSelected.emitUpdate();
    }
  },
} as CommandObject;
