const expect = require('expect');
const request = require('supertest');

const {
  ObjectID
} = require('mongodb');
const {
  app
} = require('./../server');
const {
  Todo
} = require('./../models/todo');

let todos = [
  {
    _id: new ObjectID(),
    text: 'first test'
  },
  {
    _id: new ObjectID(),
    text: 'second test'
  },
  {
    _id: new ObjectID(),
    text: 'third test'
  }
  ];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('POST / todo', () => {
  it('Should create new todo', (done) => {
    let text = 'Todo test text';

    request(app)
      .post('/todos')
      .send({
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should not create Todo with invalid data', (done) => {

    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(3);
          done();
        }).catch((e => done(e)));
      });
  });
});

describe('GET /todos', () =>{
  it('Should get all items in my todo collection', (done) => {

    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(3);
      }).end(done);
  });
});

describe('GET /todos:id', () => {
  it('Should return todo docs', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  if('Should get an 404 error for non-existing object', (done) => {

    request(app)
      .get(`/todo/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);

  });

  if('Should return 404 error if todo not found', (done) => {
    request(app)
      .get('/todos/123')
      .expect(404)
  });
});
