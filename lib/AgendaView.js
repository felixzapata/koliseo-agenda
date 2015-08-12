import { AgendaDayTemplate } from './AgendaDayTemplate';
import { AgendaDayTableModel } from './AgendaDayTableModel';
import { Modal } from './Modal';
import { closest, debug } from './util';

/**

  Displays an entire agenda, including multiple days

*/
class AgendaView {

  constructor({
    c4p, // JSON for the C4P
    agenda, // contents of the agenda as JSON
    element // DOM node to render everything into
  }) {
    // the original JSON data
    this.c4p = c4p;
    this.days = agenda.days;
    this.pageTitle = document.title;

    // this.selectedDayId
    // this.selectedTalkHash
    // this.selectedTalkCoords

    // all talks indexed by dayId/talkId
    this.talksByHash = {};
    agenda.days.forEach((day) => {
      day.tracks.forEach((track) => {
        track.slots.forEach((slot) => {
          if (slot.id) {
            const hash = slot.contents.hash = day.id + '/' + slot.id;
            this.talksByHash[hash] = slot;
          }
        })
      })
    })

    // the agenda table data, indexed by agendaDay.id
    this.models = {};

    // the DOM element to modify
    this.element = element;
  }

  render() {
    const tabIndex = !location.hash? '' : /#([^\/]+)(\/.+)?/.exec(location.hash)[1]
    const talkHash = tabIndex && location.hash.substring(1);
    const html =
      (this.days.length > 1? this.renderDayTabs() : '') +
      this.renderWorkspace();
    this.element.classList.add('kagenda');
    this.element.innerHTML = html;
    this.modal = new Modal();
    document.body.addEventListener('click', this.onClick.bind(this));
    document.body.addEventListener('keyup', this.onKeyPress.bind(this));

    this.selectTab(tabIndex);
    this.selectTalk(talkHash);
  }

  renderDayTabs() {

    const tabLinks = this.days.map(({ id, name }) => {
      return (
`
<li class="kagenda-tab-li">
<a class="kagenda-tab-a" data-day-id="${id}">${name}</a>
</li>
`
      )
    }).join('');

    return (
`
<ul class="kagenda-tabs">
${tabLinks}
</ul>
`
    )
  }

  renderWorkspace() {
    return `<div class="kworkspace"></div>`
  }

  // Select a day from the agenda
  // dayId the identifier of this day. May include a hash
  selectTab(dayId) {
    if (!this.days[dayId]) {
      dayId = this.days[0].id + '';
    }
    this.selectedDayId = dayId;

    let dayTableModel = this.models[dayId];
    if (!dayTableModel) {
      const selectedDay = this.days.filter((day) => day.id == dayId)[0];
      dayTableModel = this.models[dayId] = new AgendaDayTableModel(selectedDay);
    }

    // mark selected tab
    Array.prototype.forEach.call(this.element.querySelectorAll('.kagenda-tab-a'), (a) => {
      a.classList.toggle('selected', a.getAttribute('data-day-id') === dayId)
    })

    // render table
    this.element.querySelector('.kworkspace').innerHTML =
      new AgendaDayTemplate(dayTableModel).render();
  }

  // render a talk as modal window, by hash
  // returns the talk if found, otherwise undefined
  selectTalk(hash) {
    const talk = this.talksByHash[hash];
    if (talk) {
      const $a = document.querySelector(`.kagenda-talk-title[data-hash="${hash}"]`);
      const $cellContent = this.$cellContent = closest($a, '.kagenda-table-td');
      const rect = $cellContent.getBoundingClientRect();

      if (this.selectedTalkHash) {
        this.unselectTalk();
        this.modal.render(talk);
      } else {
        this.modal.animateGrow(rect);
        setTimeout(_ => this.modal.render(talk), 500);
      }
      $cellContent.classList.add('selected')
      this.selectedTalkHash = hash;
      this.selectedTalkCoords = this.models[this.selectedDayId].getCoords(talk.id);

      if (typeof history !== 'undefined' && history.pushState) {
        history.pushState({}, talk.title, location.pathname + location.search + '#' + hash);
      }

    }
    return talk;
  }

  unselectTalk() {
    Array.prototype.forEach.call(document.querySelectorAll('.kagenda-table-td.selected'), $cell => $cell.classList.remove('selected'));
    this.selectedTalkHash = undefined;
    this.selectedTalkCoords = undefined;
  }

  onClick(event) {
    const target = event.target;
    if (target) {
      if (target.classList.contains('kagenda-talk-title')) {
        const hash = target.getAttribute('href').substring(1);
        const talk = this.selectTalk(hash);
      }
      event.preventDefault();
    }
  }

  onClose() {
    this.unselectTalk();
  }

  onKeyPress(event) {
    console.log(event);
    if (this.selectedTalkHash && !event.altKey && !event.ctrlKey && !event.shiftKey) {
      const keyCode = event.keyCode;
      const rowDelta = keyCode == 38? -1 :
        keyCode == 40? 1 :
        0;
      const colDelta = keyCode == 37? -1 :
        keyCode == 39? 1 :
        0;
      if (rowDelta || colDelta) {
        const coords = this.selectedTalkCoords;
        const newRow = this.models[this.selectedDayId].data[coords.row + rowDelta];
        const talk = newRow && newRow[coords.col + colDelta];
        talk && this.selectTalk(talk.contents.hash);
      }
    }
  }

};

export { AgendaView }
