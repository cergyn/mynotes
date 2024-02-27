
const fileName = 'mynotes.db3';

function insertNewNote(note, checked) {
    const db = connectDb();
    const bit = checked ? 1 : 0;
    const s = 'insert into "notes" (note, checked) values (?, ?);';
    const query = db.prepare(s);
    const result = query.run(note, bit);
    console.log(result);
    db.close();
    return result;
}

function deleteNote(id) {
    const db = connectDb();
    const s = 'delete from "notes" where id = ?;';
    const query = db.prepare(s);
    const result = query.run(id);
    console.log(result);
    db.close();
    return result;
}

function connectDb(){
    const connection = require('better-sqlite3')(`./database/${fileName}`, { verbose: console.log });
    return connection;
}

function createDb(){
    const db = require('better-sqlite3')(`./database/${fileName}`, { verbose: console.log });
    db.exec('create table if not exists "notes"('+
    'id integer primary key, '+
    'note text, '+
    'checked BOOLEAN NOT NULL CHECK (checked IN (0, 1)), '+
    'created datetime default current_timestamp, '+
    'modified datetime default current_timestamp)');
    db.exec('Create Unique Index If Not Exists ByCreated on notes(created);');
    db.close();
}

function getNotes(){
    const db = connectDb();
    const query = db.prepare('select * from notes order by created desc');
    const val = query.all();
    db.close();
    return val;
}

exports.createDb = createDb;
exports.getNotes = getNotes;
exports.insertNewNote = insertNewNote;
exports.deleteNote = deleteNote;
