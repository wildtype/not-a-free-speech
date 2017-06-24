describe('NotAFreeSpeech', () => {
  var nafs;

  beforeEach(() => {
    commentsContainer = affix('.nafs-container[data-slug="first-post"]');
    commentsContainer.affix('.nafs-container__comments');
    nafs = new NotAFreeSpeech({
      readEndpoint: 'https://partyvan.prehistoric.me/approved_comments.json',
      writeEndpoint: 'https://partyvan.prehistoric.me/comments.json'
    });
  });

  describe('constructor', () => {
    it('takes the dom for comments', () => {
      expect($(nafs.ui.container)).toEqual(commentsContainer);
    });

    it('takes container and article slug', () => {
      expect(nafs.articleSlug).toEqual('first-post');
    });

    it('takes option endpoint from params', () => {
      expect(nafs.readEndpoint).toEqual('https://partyvan.prehistoric.me/approved_comments.json');
      expect(nafs.writeEndpoint).toEqual('https://partyvan.prehistoric.me/comments.json');
    });
  });

  describe('init', () => {
    it('calls buildForm and loadComments', () => {
      spyOn(nafs, 'buildForm');
      spyOn(nafs, 'loadComments');
      nafs.init();

      expect(nafs.buildForm).toHaveBeenCalled();
      expect(nafs.loadComments).toHaveBeenCalled();
    });
  });

  describe('buildForm', () => {
    it('create form elements', () => {
      nafs.buildForm();

      expect(nafs.ui.container).toContainElement('form.nafs-form');
      expect(nafs.ui.form).toContainElement('input[type="text"][name="name"]');
      expect(nafs.ui.form).toContainElement('input[type="text"][name="email"]');
      expect(nafs.ui.form).toContainElement('input[type="text"][name="website"]');
      expect(nafs.ui.form).toContainElement('textarea[name="comment"]');
    });

    it('bind event on submit to form', () => {
      spyOn(nafs, 'submitForm');
      nafs.buildForm();

      $(nafs.ui.form).trigger('submit');
      expect(nafs.submitForm).toHaveBeenCalled();
    });
  });

  describe('loadComments', () =>{
    var fakeReply = { comments: [] };
    beforeEach(() => {
      jasmine.Ajax.install();
    });

    afterEach(() => {
      jasmine.Ajax.uninstall();
    });

    it('calls ajax to comments backend, readEndpoint', () =>{
      nafs.loadComments();

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toEqual('https://partyvan.prehistoric.me/approved_comments.json');
    });

    it('will call appendComments when succeed', () => {
      spyOn(nafs, 'appendComments');
      nafs.loadComments();

      var request = jasmine.Ajax.requests.mostRecent();
      request.respondWith({status: 200, responseText: JSON.stringify(fakeReply)});

      expect(nafs.appendComments).toHaveBeenCalled();
      expect(nafs.appendComments.calls.mostRecent().args[0]).toEqual(fakeReply);
    });
  });

  describe('submitForm', () =>{
    var dummyTarget = jasmine.createSpyObj('dummyTarget', ['preventDefault']);

    beforeEach(() => {
      nafs.buildForm();

      $('.nafs-form input[name=name]').val('myname');
      $('.nafs-form input[name=email]').val('mymail@email.com');
      $('.nafs-form input[name=website]').val('https://whatever.com');
      $('.nafs-form textarea').val('this is comments');

      jasmine.Ajax.install();
    });

    afterEach(() => {
      jasmine.Ajax.uninstall();
    });

    it('calls disableForm', () => {
      spyOn(nafs, 'disableForm');
      nafs.submitForm(dummyTarget);
      expect(nafs.disableForm).toHaveBeenCalled();
    });

    it('takes data from form and validates then submit via ajax', () => {
      nafs.submitForm(dummyTarget);

      expect(dummyTarget.preventDefault).toHaveBeenCalled();

      var request = jasmine.Ajax.requests.mostRecent();
      expect(request.url).toEqual(nafs.writeEndpoint);
      expect(request.method).toEqual('POST');
      expect(request.params).toEqual(JSON.stringify({
        slug: 'first-post',
        name: 'myname',
        email: 'mymail@email.com',
        website: 'https://whatever.com',
        comment: 'this is comments'
      }));
    });
  });

  describe('disableForm', () => {
    it('disables inputs and button', () => {
      nafs.buildForm();
      nafs.disableForm();

      expect($('input[name=name]')).toBeDisabled();
      expect($('input[name=email]')).toBeDisabled();
      expect($('input[name=website]')).toBeDisabled();
      expect($('textarea[name=comment]')).toBeDisabled();
    });
  });

  describe('enableForm', () => {
    beforeEach(() => {
      nafs.buildForm();

      $('.nafs-form input[name=name]').prop('disabled', true);
      $('.nafs-form input[name=email]').prop('disabled', true);
      $('.nafs-form input[name=website]').prop('disabled', true);
      $('.nafs-form textarea').prop('disabled', true);
    });

    it('enable forms', () => {
      nafs.enableForm();

      expect($('input[name=name]')).not.toBeDisabled();
      expect($('input[name=email]')).not.toBeDisabled();
      expect($('input[name=website]')).not.toBeDisabled();
      expect($('textarea[name=comment]')).not.toBeDisabled();
    });
  });
});
