'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {performance}=require('node:perf_hooks');
const MODIFIERS=new Set(['shift','control','ctrl','alt','meta','altgr','altgraph','capslock','numlock','left','right','isautorepeat','iskeypad']);
function physicalCode(value){return typeof value==='string'&&value.length<=32&&/^(Key[A-Z]|Digit[0-9]|(?:Control|Alt|Shift|Meta)(?:Left|Right)|F(?:[1-9]|1[0-9]|2[0-4])|Arrow(?:Up|Down|Left|Right)|Space|Tab|Enter|Escape|Backspace|Delete|Insert|Home|End|PageUp|PageDown|Equal|Minus|BracketLeft|BracketRight|Backslash|Semicolon|Quote|Comma|Period|Slash|Backquote|CapsLock|NumLock|Numpad(?:[0-9]|Add|Subtract|Multiply|Divide|Decimal|Enter)|Unidentified)$/.test(value)?value:'Unidentified';}
function keyboardRecord(source,input){
 const electron=source==='electron';
 const modifiers=Array.isArray(input.modifiers)?input.modifiers.slice(0,12).filter(value=>typeof value==='string'&&MODIFIERS.has(value.toLowerCase())).map(value=>value.toLowerCase()).slice(0,12):[];
 return {source,type:input.type,code:physicalCode(input.code),ctrl:(electron?input.control:input.ctrl)===true,alt:input.alt===true,shift:input.shift===true,meta:input.meta===true,
  altGraph:electron?modifiers.some(value=>value==='altgr'||value==='altgraph'):input.altGraph===true,
  repeat:(electron?input.isAutoRepeat:input.repeat)===true,composing:input.isComposing===true,
  location:[0,1,2,3].includes(input.location)?input.location:0,modifiers,
  modifierState:electron?null:{ctrl:input.modifierState?.ctrl===true,alt:input.modifierState?.alt===true,shift:input.modifierState?.shift===true,altGraph:input.modifierState?.altGraph===true}};
}
class ShortcutDiagnostics{
 constructor({enabled=false,write=()=>{},clock=()=>performance.now(),maximum=2048}={}){this.enabled=enabled;this.write=write;this.clock=clock;this.maximum=maximum;this.records=[];this.active=null;this.session=0;this.sequence=0;this.truncated=false;this.origin=this.clock();this.held={dom:new Set(),electron:new Set()};}
 append(record){if(this.records.length>=this.maximum){this.truncated=true;return;}this.records.push({order:++this.sequence,elapsedMs:Math.max(0,Math.round(this.clock()-this.origin)),session:this.session,...record});}
 begin(token){if(!this.enabled)return;if(this.active)this.end('replaced');this.active=token;this.held.dom.clear();this.held.electron.clear();this.session++;this.append({source:'session',type:'begin'});}
 record(source,input,token){
  if(!this.enabled||!this.active||!input||typeof input!=='object')return;
  if(source==='dom'&&token!==this.active)return;
  if(!['dom','electron'].includes(source)||!['keyDown','keyUp'].includes(input.type))return;
  const record=keyboardRecord(source,input),held=this.held[source];
  if(/^(Control|Alt|Shift|Meta)(Left|Right)$/.test(record.code)){if(record.type==='keyDown')held.add(record.code);else held.delete(record.code);}
  this.append({...record,heldModifiers:[...held].sort()});
 }
 end(reason='closed'){
  if(!this.enabled||!this.active)return;
  this.append({source:'session',type:'end',reason:['closed','replaced','shutdown'].includes(reason)?reason:'closed'});this.active=null;
  try{this.write({schemaVersion:1,ordering:'main-process receipt order; elapsed time is not OS event time',truncated:this.truncated,records:this.records});}catch{console.warn('Shortcut diagnostic report could not be written.');}
 }
}
function writeDiagnosticReport(directory,report){
 const destination=path.join(directory,'shortcut-diagnostics.json'),temporary=destination+'.tmp';
 for(const file of [destination,temporary])if(fs.existsSync(file)&&(!fs.lstatSync(file).isFile()||fs.lstatSync(file).isSymbolicLink()))throw new Error('Unsafe diagnostic output');
 let descriptor;
 try{descriptor=fs.openSync(temporary,'wx',0o600);fs.writeFileSync(descriptor,JSON.stringify(report,null,2));fs.fsyncSync(descriptor);fs.closeSync(descriptor);descriptor=null;fs.renameSync(temporary,destination);}
 finally{if(descriptor!==undefined&&descriptor!==null)fs.closeSync(descriptor);}
}
module.exports={ShortcutDiagnostics,keyboardRecord,writeDiagnosticReport};
