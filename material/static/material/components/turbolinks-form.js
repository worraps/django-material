import {autoInit, base} from 'material-components-web';


export class DMCTurbolinksForm extends base.MDCComponent {
  static attachTo(root) {
    return new DMCTurbolinksForm(root, new base.MDCFoundation());
  }

  performPostRequest() {
    // disable all form buttons
    this.root_.querySelectorAll('button').forEach(
      (button) => button.disabled=true
    );

    let xhr = new XMLHttpRequest();
    xhr.open('POST', window.location.search, true);
    xhr.setRequestHeader('Turbolinks-Referrer', window.location);

    xhr.onload = (event) => {
      let location = xhr.getResponseHeader('turbolinks-location');
      let snapshot = window.Turbolinks.Snapshot.wrap(xhr.response);

      if (!location) {
        location = window.location.href;
      }

      window.Turbolinks.controller.adapter.hideProgressBar();
      window.Turbolinks.controller.cache.put(location, snapshot);
      window.Turbolinks.visit(location, {action: 'restore'});

      if (xhr.status > 299) {
        Turbolinks.controller.disable();
      }
    };

    window.Turbolinks.controller.adapter.showProgressBarAfterDelay();
    xhr.send(new FormData(this.root_));
  }

  performGetRequest() {
    const formData = Array.from(
      new FormData(this.root_).entries(),
      (entry) => entry.map(encodeURIComponent).join('=')
    ).join('&');

    window.Turbolinks.visit(
      this.root_.action +
        (this.root_.action.indexOf('?') == -1 ? '?' : '&') +
        formData
    );
  }

  initialize() {
    if (!window.Turbolinks) {
      return false;
    }

    if (this.root_.method == 'post') {
      this.onSubmit = (event) => {
        event.preventDefault();
        this.performPostRequest();
      };

      this.root_.addEventListener('submit', this.onSubmit);
    } else {
      this.onSubmit = (event) => {
        event.preventDefault();
        this.performGetRequest();
      };

      this.root_.addEventListener('submit', this.onSubmit);
    }
  }

  destroy() {
    if (this.onSubmit) {
      this.root_.removeEventListener('click', this.onSubmit);
    }
  }
}

autoInit.register('DMCTurbolinksForm', DMCTurbolinksForm);
