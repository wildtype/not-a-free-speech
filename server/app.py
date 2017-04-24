from flask import Flask, jsonify, request, abort, escape
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'
db = SQLAlchemy(app)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String())
    email = db.Column(db.String())
    website = db.Column(db.String())
    article_slug = db.Column(db.String())
    comment = db.Column(db.String())

    def __init__(self, name=None, email=None, article_slug=None, website=None, comment=None):
        self.name = name
        self.email = email
        self.website = website
        self.article_slug = article_slug
        self.comment = comment

    def data(self):
        return {
            'name': self.name, 'email': self.email,
            'website': self.website, 'comment': self.comment
        }

    @classmethod
    def create_from_json(klass, request_json):
        article_slug = request_json.get('article_slug', None)
        name = request_json.get('name', None)
        email = request_json.get('email', None)
        website = request_json.get('website', None)
        comment = request_json.get('comment', None)
        comment = escape(comment)
        return klass(
            name=name, email=email, website=website,
            article_slug=article_slug, comment=comment
        )


@app.route('/comments/<string:article_slug>', methods=['GET'])
def comments_get(article_slug):
    comments = Comment.query.filter_by(article_slug=article_slug).all()
    return jsonify({'comments': [comment.data() for comment in comments]})


@app.route('/comments', methods=['POST'])
def comment_create():
    new_comment = Comment.create_from_json(request.json)
    if new_comment:
        db.session.add(new_comment)
        db.session.commit()
        return jsonify({ 'comments': [new_comment.data()] })
    else:
        return abort(422)

if __name__ == '__main__':
    app.run()
