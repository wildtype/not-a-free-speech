export default class NotAFreeSpeech {
  constructor(options) {
    this.sel = {
      container: '.nafs-container',
      itemContainer: '.nafs-container__comments',
    };

    this.ui = {
      container: document.querySelector(this.sel.container),
      itemContainer: document.querySelector(this.sel.itemContainer),
    };

    this.articleSlug = this.ui.container.getAttribute('data-slug');
    this.readEndpoint = options.readEndpoint;
    this.writeEndpoint = options.writeEndpoint;
  }

  init(){
    this.buildForm();
    this.loadComments();
  }

  buildForm() {
    let formTemplate = this.formTemplate();

    let parser = new DOMParser()
      , form = parser.parseFromString(formTemplate, 'text/html');

    this.ui.form = form.childNodes[0];
    this.ui.container.appendChild(this.ui.form);
    this.ui.form.onsubmit = this.submitForm.bind(this);
  }

  loadComments() {
    let request = new XMLHttpRequest();
    request.onload = () => {
      if (request.status == 200) {
        this.appendComments(JSON.parse(request.response));
      }
    };

    request.open('GET', this.readEndpoint);
  }

  appendComments(comments) { }

  formInput(name) {
    return document.querySelector(`.nafs-form [name=${name}]`);
  }

  disableForm() {
    this.formInput('name').disabled = true;
    this.formInput('email').disabled = true;
    this.formInput('website').disabled = true;
    this.formInput('comment').disabled = true;
  }

  enableForm() {
    this.formInput('name').disabled = false;
    this.formInput('email').disabled = false;
    this.formInput('website').disabled = false;
    this.formInput('comment').disabled = false;
  }

  submitForm(e) {
    e.preventDefault();
    let name    = this.formInput('name').value
      , email   = this.formInput('email').value
      , website = this.formInput('website').value
      , comment = this.formInput('comment').value
      , commentData = {
        slug: this.articleSlug,
        name: name, email: email,
        website: website, comment: comment
      };

    this.disableForm();

    let xhr = new XMLHttpRequest();
    xhr.open('POST', this.writeEndpoint);
    xhr.send(JSON.stringify(commentData));
  }

  formTemplate() {
    return `
      <div class="nafs-form__container">
        <form class="nafs-form" id="nafs-form" action="#" method="POST">
          <div>
            <label for="nafs-form__body">Komentar</label>
            <textarea id="nafs-form__body" name="comment" placeholder="Komentar"></textarea>
          </div>

          <div>
            <label for="nafs-form__name">Nama (tidak wajib)</label>
            <input type="text" name="name" id="nafs-form__name" placeholder="Nama (tidak wajib)" />
          </div>

          <div>
            <label for="nafs-form__email">Email (tidak wajib)</label>
            <input type="text" name="email" id="nafs-form__email" placeholder="Email (tidak wajib)"/>
          </div>

          <div>
            <label for="nafs-form__website">Website (tidak wajib)</label>
            <input type="text" name="website" id="nafs-form__website" placeholder="Website (tidak wajib)" />
          </div>

          <div>
            <button>Kirim</button>
          </div>
        </form>
      </div>`;
  }
}
