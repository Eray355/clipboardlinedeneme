'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {ShortcutDiagnostics,writeDiagnosticReport}=require('../lib/shortcut-diagnostics.cjs');
function fixture(options={}){const reports=[];let time=0;const trace=new ShortcutDiagnostics({enabled:true,clock:()=>time++,write:report=>reports.push(structuredClone(report)),...options});return{trace,reports};}
test('diagnostics are disabled by default and ignore events outside a recording session',()=>{
 const defaults=new ShortcutDiagnostics();assert.equal(defaults.enabled,false);defaults.begin('token');defaults.record('electron',{type:'keyDown',code:'KeyA'});assert.deepEqual(defaults.records,[]);
 const {trace,reports}=fixture({enabled:false});trace.begin('token');trace.record('electron',{type:'keyDown',code:'KeyA'});trace.end();assert.deepEqual(trace.records,[]);assert.deepEqual(reports,[]);
 const active=fixture();active.trace.record('dom',{type:'keyDown',code:'KeyA'},'token');active.trace.end();assert.deepEqual(active.reports,[]);assert.deepEqual(active.trace.records,[]);
});
test('physical modifier state and source receipt order survive missing chord flags without changing events',()=>{
 const {trace,reports}=fixture();trace.begin('one');
 for(const source of ['electron','dom'])for(const code of ['ControlLeft','AltLeft','KeyA'])trace.record(source,{type:'keyDown',code,ctrl:false,alt:false,control:false,modifierState:{altGraph:true},altGraph:true,modifiers:source==='electron'?['altgr']:[]},'one');
 trace.record('dom',{type:'keyUp',code:'AltLeft'},'one');trace.end();
 const a=reports[0].records.filter(value=>value.code==='KeyA');assert.equal(a.length,2);
 for(const value of a){assert.deepEqual(value.heldModifiers,['AltLeft','ControlLeft']);assert.equal(value.ctrl,false);assert.equal(value.alt,false);assert.equal(value.altGraph,true);}
 assert.deepEqual(reports[0].records.map(value=>value.order),[1,2,3,4,5,6,7,8,9]);
 assert.deepEqual(reports[0].records.at(-2).heldModifiers,['ControlLeft']);
});
test('records allowlisted fields only, reject stale tokens, and reset held state between sessions',()=>{
 const {trace,reports}=fixture();trace.begin('private-token');
 trace.record('dom',{type:'keyDown',code:'KeyZ'},'stale');
 trace.record('dom',{type:'keyDown',code:'ControlLeft',ctrl:true,key:'private text',clipboard:'secret',path:'private path'},'private-token');
 trace.end();trace.record('electron',{type:'keyDown',code:'KeyZ'});trace.begin('next');
 trace.record('dom',{type:'keyDown',code:'not a physical code: secret',modifiers:['secret','shift'],repeat:true,isComposing:true,location:99},'next');trace.end();
 const json=JSON.stringify(reports);for(const value of ['private-token','private text','clipboard','private path','secret','KeyZ'])assert.equal(json.includes(value),false,value);
 const last=reports.at(-1).records.at(-2);assert.equal(last.code,'Unidentified');assert.deepEqual(last.modifiers,['shift']);assert.deepEqual(last.heldModifiers,[]);assert.equal(last.repeat,true);assert.equal(last.composing,true);assert.equal(last.location,0);
});
test('reports are bounded and a write failure does not keep capture active',()=>{
 const {trace,reports}=fixture({maximum:4});trace.begin('one');for(let n=0;n<50;n++)trace.record('electron',{type:'keyDown',code:'KeyA'});trace.end();assert.equal(reports[0].records.length,4);assert.equal(reports[0].truncated,true);assert.equal(trace.active,null);
 const failing=fixture({write:()=>{throw new Error('synthetic');}});failing.trace.begin('one');failing.trace.end();assert.equal(failing.trace.active,null);
});
test('local report writer replaces its own report and rejects symlink destinations',()=>{
 const directory=fs.mkdtempSync(path.join(os.tmpdir(),'clipboardline-shortcut-diagnostics-'));
 try{writeDiagnosticReport(directory,{records:[]});writeDiagnosticReport(directory,{records:[{order:1}]});assert.deepEqual(JSON.parse(fs.readFileSync(path.join(directory,'shortcut-diagnostics.json'))),{records:[{order:1}]});
  if(process.platform!=='win32'){fs.unlinkSync(path.join(directory,'shortcut-diagnostics.json'));const target=path.join(directory,'preserved');fs.writeFileSync(target,'preserved');fs.symlinkSync(target,path.join(directory,'shortcut-diagnostics.json'));assert.throws(()=>writeDiagnosticReport(directory,{}),/Unsafe/);assert.equal(fs.readFileSync(target,'utf8'),'preserved');}
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});

test('keyboard capture never reads character text, clipboard fields, or application data',()=>{
 const {trace,reports}=fixture();trace.begin('one');
 const input={type:'keyDown',code:'KeyA',control:true,alt:true};
 for(const field of ['key','text','clipboard','title','path','data'])Object.defineProperty(input,field,{get(){throw new Error('sensitive field read');}});
 assert.doesNotThrow(()=>trace.record('electron',input));trace.end();
 assert.equal(reports[0].records[1].code,'KeyA');
});
