import { formatMarkdown } from './stringutils';
import { strToEl, setTabIndex } from './util';
import { TalkFeedback } from './feedback';

class TalkDetailsPopup {

  constructor({ talk, tagColors }) {
    this.talk = talk;
    this.tagColors = tagColors;
    this.feedback = new TalkFeedback(talk);
  }

  render() {
    const talk = this.talk;
    let links = !talk.videoUrl && !talk.slidesUrl? '' : `<div class="ka-links ka-right">
      ${!talk.slidesUrl? '' : `<a href="${talk.slidesUrl}" target="_blank" class="icon-slideshare" title="Slides"><span class="sr-only">Slides in new window of "${talk.title}"</span></a>`}
      ${!talk.videoUrl? '' : `<a href="${talk.videoUrl}" target="_blank" class="icon-youtube-play" title="Video"><span class="sr-only">Video in new window of "${talk.title}"</span></a>`}
    </div>`;
    const html = `
      <div class="ka-talk-details-window" role="dialog" aria-labelledby="title-dlg">
        <a class="ka-close" title="close"><span class="sr-only">close the detail of the talk</span></a>
        <div class="ka-talk-details-viewport">
          <div class="ka-talk-details-inner">
            <div class="ka-talk-details-contents">
              <h2 id="title-dlg" class="ka-talk-details-title">${links} ${talk.title} ${this.feedback.renderFeedback()}</h2>
              <div class="ka-talk-details-description">${formatMarkdown(talk.description)}</div>
              ${this.renderTags(talk.tags)}
              <div class="ka-feedback-entries"></div>
            </div>
            <ul class="ka-avatars">
              ${talk.authors.map(this.renderAuthor).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
    const mainDocument = document.querySelector('body');
    mainDocument.setAttribute('aria-hidden', true);
    setTabIndex(mainDocument, -1);
    document.body.insertAdjacentHTML('beforeend', html);
    const lightbox = document.querySelector('.ka-talk-details-window');
    const oldTabIndex = lightbox.getAttribute('tabindex');
    document.querySelector('.ka-overlay').classList.remove('ka-hidden');
    lightbox.setAttribute('tabindex', 0);
    lightbox.focus();
    lightbox.setAttribute('tabindex', oldTabIndex);
    this.feedback.renderFeedbackEntries(document.querySelector('.ka-feedback-entries'));
  }

  renderTags() {
    const tags = this.talk.tags;
    if (!tags) {
      return '';
    }
    return '<div class="ka-tags">' +
      Object.keys(tags).map(category => {
        return tags[category].map(tag => `<span class="tag tag${this.tagColors[category]}">${tag}</span>`).join(' ')
      }).join(' ') +
      '</div>'
  }

  renderAuthor({ id, uuid, name, avatar, description }) {
    avatar = avatar.indexOf('//') == 0? ('https:' + avatar) : avatar;
    return `
      <li class="ka-avatar-li ka-avatar-and-text">
        <a href="https://www.koliseo.com/${uuid}" class="ka-avatar-container">
          <span style="display:table-row">
            <img class="ka-avatar-img" src="${avatar}">
            <span class="ka-author-name">${name}</a>
          </span>
        </a>
        <div class="ka-author-data">
          <div class="ka-author-description">${formatMarkdown(description)}</div>
        </div>
      </li>
    `
  }


};

export { TalkDetailsPopup };
