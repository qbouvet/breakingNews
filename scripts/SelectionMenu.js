import {EventCodes} from './EventCodes.js';

export class SelectionMenu {

  constructor(mapSelectionCallback) {

    this.mapUpdate = mapSelectionCallback;
    this.CAMEO = new EventCodes();

    this.master1 = d3.select("#class-1");
    this.types1 = d3.selectAll(".class-1");

    this.selectedTypes = new Set(Object.keys(this.CAMEO.types).map(Number));
    console.log(this.selectedTypes)

    this.master1.on("change", () => {
      let checked = this.master1.property("checked");
      this.types1.property("checked", checked);
      checked ? this.add(this.CAMEO.classes[1]['types']) : this.remove(this.CAMEO.classes[1]['types']);
    });

    this.types1.on("change", (d, i) => {
      let type = this.CAMEO.classes[1]['types'][i];
      let checked = d3.select("#type-" + type).property("checked");
      checked ? this.add([type]) : this.remove([type]);
    });

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
