import {EventCodes} from './EventCodes.js';

export class SelectionMenu {

  constructor(mapSelectionCallback) {

    this.mapUpdate = mapSelectionCallback;
    this.CAMEO = new EventCodes();

    this.selectedTypes = new Set(Object.keys(this.CAMEO.types).map(Number));

    this.addCheckboxBehavior();

  }

  addCheckboxBehavior() {

    for (let c of Object.keys(this.CAMEO.classes).map(Number)) {

      let masterCheckbox = d3.select("#class-" + c);
      let childrenCheckboxes = d3.selectAll(".class-" + c);

      masterCheckbox.on("change", () => {
        let checked = masterCheckbox.property("checked");
        childrenCheckboxes.property("checked", checked);
        checked ? this.add(this.CAMEO.classes[c]['types']) : this.remove(this.CAMEO.classes[c]['types']);
      });

      childrenCheckboxes.on("change", (d, i) => {
        let type = this.CAMEO.classes[c]['types'][i];
        let checked = d3.select("#type-" + type).property("checked");
        checked ? this.add([type]) : this.remove([type]);
      });

    }
  }

  checkSelected(d) {
    return this.selectedTypes.has(this.CAMEO.codes[d['Code']]['type']);
  }

  remove(typeList) {

    typeList.forEach((d, i) => {
      this.selectedTypes.delete(d);
    });

    this.mapUpdate((d) => this.checkSelected(d));
  }

  add(typeList) {

    typeList.forEach((d, i) => {
      this.selectedTypes.add(d);
    });

    this.mapUpdate((d) => this.checkSelected(d));
  }




}
