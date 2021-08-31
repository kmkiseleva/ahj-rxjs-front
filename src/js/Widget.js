import { interval, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, map, mergeMap, timestamp } from 'rxjs/operators';

export default class Widget {
  constructor(container) {
    this.container = container;
    this.messagesContainer = document.querySelector('.widget__content');
    this.messagesIdContainer = [];
    this.buttonSubscribe = document.querySelector('.button__subscribe');
  }

  init() {
    this.registerEvents();
    // this.subscribeOnStreams();
  }

  registerEvents() {
    this.buttonSubscribe.addEventListener('click', () => {
      this.subscribeOnStreams();
    });
  }

  subscribeOnStreams() {
    this.messageStream$ = interval(3000)
      .pipe(
        mergeMap(() =>
          ajax.getJSON('https://ahj-rxjs-back.herokuapp.com/messages/unread').pipe(
            map((response) => {
              const filteredResponse = response.messages.filter(
                (message) => !this.messagesIdContainer.includes(message.id)
              );
              filteredResponse.forEach((message) => this.messagesIdContainer.push(message.id));
              return filteredResponse;
            }),
            timestamp(),
            catchError(() =>
              of({
                value: [],
              })
            )
          )
        )
      )
      .subscribe((response) => {
        response.value.forEach((message) => this.addMessage(response.timestamp, message));
      });
  }

  addMessage(currentDate, message) {
    const messageHTML = this.markupMessage(currentDate, message);
    this.messagesContainer.insertAdjacentHTML('afterbegin', messageHTML);
  }

  markupMessage(currentDate, message) {
    const sourceDate = new Date(currentDate);
    const date = `${sourceDate
      .toLocaleTimeString()
      .slice(0, 5)} ${sourceDate.toLocaleDateString()}`;
    return `
    <div class="message" data-post-id=${message.id}>
            <div class="message__body">
              <div class="message__from">${message.from}</div>
              <div class="message__text">${message.subject.slice(0, 15)}</div>
              <div class="message__received-data">${date}</div>
            </div>
    </div>
    `;
  }
}
