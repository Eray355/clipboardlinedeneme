'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {Store}=require('../lib/model.cjs');
const LIMIT=64*1024*1024;
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64');
function fixture(run){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'clipboardline-byte-limit-'));
 try{const store=new Store(dir,{clock:()=>1000});return run(store,dir);}finally{fs.rmSync(dir,{recursive:true,force:true});}
}
function fill(store,bytes){
 const item=store.insert('image',png);
 // Valid, individually bounded records, including Unicode and JSON escapes.
 const base=store.createNote({text:'synthetic 😀\\"',title:'Synthetic'});
 for(let i=0;i<64;i++)store.data.items.push({...structuredClone(base),id:crypto.randomUUID(),text:'x'.repeat(1024*1024-1000)});
 item.ocrText='界😀';item.annotations=[{text:'Türkçe 😀',x:0,y:0}];
 const remaining=bytes-Buffer.byteLength(JSON.stringify(store.data));
 assert.ok(remaining>0&&remaining<1024*1024);
 item.ocrText+='x'.repeat(remaining);
 return item;
}
function disk(store){return [store.file,store.file+'.backup'].map(file=>fs.readFileSync(file));}
for(const delta of [-1,0,1])test(`UTF-8 library at 64 MiB ${delta<0?'- 1':delta>0?'+ 1':'exactly'} bytes`,()=>fixture(store=>{
 const item=fill(store,LIMIT+delta),before=disk(store),revision=store.revision;
 if(delta>0){assert.throws(()=>store.persist(),/safe save size/);assert.deepEqual(disk(store),before);assert.equal(store.revision,revision);assert.deepEqual(store.data,JSON.parse(before[0]));}
 else{store.persist();assert.equal(fs.statSync(store.file).size,LIMIT+delta);assert.deepEqual(fs.readFileSync(store.file+'.backup'),before[0]);const reopened=new Store(store.directory,{clock:()=>1000});assert.deepEqual(reopened.data,store.data);assert.equal(reopened.item(item.id).ocrText,item.ocrText);}
}));
test('oversize note, OCR, annotation and insert mutations preserve durable state and item references',()=>fixture(store=>{
 const image=fill(store,LIMIT);store.persist();
 const before=disk(store),snapshot=JSON.parse(before[0]),revision=store.revision;
 const unchanged=()=>{assert.deepEqual(disk(store),before);assert.deepEqual(store.data,snapshot);assert.equal(store.item(image.id),image);assert.equal(store.revision,revision);};
 assert.throws(()=>store.modify('note',{id:image.id,note:'😀'}),/safe save size/);unchanged();
 image.ocrText+='界';assert.throws(()=>store.persist(),/safe save size/);unchanged();
 assert.throws(()=>store.modify('saveImage',{id:image.id,dataUrl:'data:image/png;base64,'+png.toString('base64'),annotations:[{text:'😀'.repeat(100000)}]}),/safe save size/);unchanged();
 assert.throws(()=>store.insert('text','new synthetic capture'),/safe save size/);unchanged();
 assert.throws(()=>store.createNote({text:'new note',title:'😀'}),/safe save size/);unchanged();
 // A rejected mutation does not poison subsequent valid saves or recovery.
 image.ocrText=image.ocrText.slice(0,-1000);store.persist();assert.deepEqual(new Store(store.directory,{clock:()=>1000}).data,store.data);
}));
test('an oversize first save restores the empty store and creates no files',()=>fixture(store=>{
 const empty=structuredClone(store.data);
 store.data.items=Array.from({length:65},()=>({id:crypto.randomUUID(),kind:'text',text:'x'.repeat(1024*1024),folderIds:[],tags:[],pinned:true}));
 assert.throws(()=>store.persist(),/safe save size/);
 assert.deepEqual(store.data,empty);assert.equal(store.revision,0);
 assert.equal(fs.existsSync(store.file),false);assert.equal(fs.existsSync(store.file+'.backup'),false);
}));
test('oversize rollback preserves distinct legacy records with repeated IDs',()=>fixture(store=>{
 const first=store.insert('text','first legacy record');
 const second={...structuredClone(first),text:'second legacy record'};
 store.data.items.push(second);store.persist();
 const before=disk(store),snapshot=structuredClone(store.data);
 first.ocrText='x'.repeat(LIMIT);
 assert.throws(()=>store.persist(),/safe save size/);
 assert.deepEqual(store.data,snapshot);assert.deepEqual(disk(store),before);
 assert.equal(store.data.items[0],first);assert.equal(store.data.items[1],second);
 assert.notEqual(first,second);
 assert.deepEqual(new Store(store.directory,{clock:()=>1000}).data,snapshot);
}));
