import{r as c,j as f,c as ue,_ as Re,D as Te,f as se,p as xe,W as R,i as Ie,e as Ne,a as Ae,A as Le}from"./immer-Lfe58CvZ.js";const be=e=>{const t=c.useRef();return c.useEffect(()=>{t.current=e},[e]),t.current},$e="_container_1qpk0_25",ke="_label_1qpk0_33",Ve="_cells_1qpk0_37",qe="_cell_1qpk0_37",De="_appear_1qpk0_1",Fe="_middleCell_1qpk0_62",We="_cellContent_1qpk0_69",ze="_slideIn_1qpk0_79",Ue="_slideOut_1qpk0_82",He="_cellNumber_1qpk0_85",C={container:$e,label:ke,cells:Ve,cell:qe,appear:De,middleCell:Fe,cellContent:We,slideIn:ze,slideOut:Ue,cellNumber:He},$=10,Be=c.memo(function({index:t,value:r,headPosition:n}){const i=t-n+$-1,o=be(r);return f.jsxs("div",{className:C.cell,style:{left:i*30+i*15+"px",zIndex:t},children:[o!==r&&f.jsx("div",{className:ue(C.cellContent,C.slideOut),children:o},o),f.jsx("div",{className:ue(C.cellContent,{[C.slideIn]:o!==r}),children:r},r),f.jsx("div",{className:C.cellNumber,children:t})]},t)}),Ge=({tape:e,headPosition:t,label:r="Tape"})=>{const n=be(t),i=t-(n??0),o=i<0?Math.abs(i):0,a=i>0?i:0;return f.jsxs("div",{className:C.container,children:[f.jsxs("div",{className:C.label,children:[r,":"]}),f.jsxs("div",{className:C.cells,style:{width:($*2-1)*30+($*2-2)*15+"px"},children:[Re.range(t-$-o,t+$+1+a).map(u=>f.jsx(Be,{value:e.get(u),index:u,headPosition:t},u)),f.jsx("div",{className:C.cell+" "+C.middleCell})]})]})},Ke=({curState:e,curEvent:t})=>(console.log("Rendering",e,t),t.name==="error"?f.jsxs("div",{children:["Error while running: ",t.error+""]}):f.jsxs("div",{children:[e.machineState.status,f.jsx("br",{}),e.machineState.description,f.jsx("br",{}),f.jsx(Ge,{tape:e.tape,headPosition:e.machineState.curPosition}),"Selected rule:",t.name=="fetch"&&(t.args[0]===null?"Not found.":t.args[0].fullString)]})),Ye="_tapeContainer_ret51_1",Je="_tapeCell_ret51_5",ee={tapeContainer:Ye,tapeCell:Je};class oe{[Te]=!0;_tapeContainer=new Map;constructor(){}copy(){const t=new oe;return t._tapeContainer=new Map(this._tapeContainer),t}set(t,r){r==="_"?this._tapeContainer.delete(t):this._tapeContainer.set(t,r)}get(t){return this._tapeContainer.get(t)||"_"}}function Qe(e){var t=c.useState(function(){return se(typeof e=="function"?e():e,!0)}),r=t[1];return[t[0],c.useCallback(function(n){r(typeof n=="function"?xe(n):se(n))},[])]}function Xe(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function le(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),r.push.apply(r,n)}return r}function fe(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?le(Object(r),!0).forEach(function(n){Xe(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):le(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}function Ze(e,t){if(e==null)return{};var r={},n=Object.keys(e),i,o;for(o=0;o<n.length;o++)i=n[o],!(t.indexOf(i)>=0)&&(r[i]=e[i]);return r}function et(e,t){if(e==null)return{};var r=Ze(e,t),n,i;if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)n=o[i],!(t.indexOf(n)>=0)&&Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}function tt(e,t){return rt(e)||nt(e,t)||it(e,t)||ot()}function rt(e){if(Array.isArray(e))return e}function nt(e,t){if(!(typeof Symbol>"u"||!(Symbol.iterator in Object(e)))){var r=[],n=!0,i=!1,o=void 0;try{for(var a=e[Symbol.iterator](),u;!(n=(u=a.next()).done)&&(r.push(u.value),!(t&&r.length===t));n=!0);}catch(d){i=!0,o=d}finally{try{!n&&a.return!=null&&a.return()}finally{if(i)throw o}}return r}}function it(e,t){if(e){if(typeof e=="string")return de(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);if(r==="Object"&&e.constructor&&(r=e.constructor.name),r==="Map"||r==="Set")return Array.from(e);if(r==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r))return de(e,t)}}function de(e,t){(t==null||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function ot(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function at(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function pe(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter(function(i){return Object.getOwnPropertyDescriptor(e,i).enumerable})),r.push.apply(r,n)}return r}function he(e){for(var t=1;t<arguments.length;t++){var r=arguments[t]!=null?arguments[t]:{};t%2?pe(Object(r),!0).forEach(function(n){at(e,n,r[n])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):pe(Object(r)).forEach(function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))})}return e}function ct(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];return function(n){return t.reduceRight(function(i,o){return o(i)},n)}}function k(e){return function t(){for(var r=this,n=arguments.length,i=new Array(n),o=0;o<n;o++)i[o]=arguments[o];return i.length>=e.length?e.apply(this,i):function(){for(var a=arguments.length,u=new Array(a),d=0;d<a;d++)u[d]=arguments[d];return t.apply(r,[].concat(i,u))}}}function H(e){return{}.toString.call(e).includes("Object")}function ut(e){return!Object.keys(e).length}function q(e){return typeof e=="function"}function st(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function lt(e,t){return H(t)||_("changeType"),Object.keys(t).some(function(r){return!st(e,r)})&&_("changeField"),t}function ft(e){q(e)||_("selectorType")}function dt(e){q(e)||H(e)||_("handlerType"),H(e)&&Object.values(e).some(function(t){return!q(t)})&&_("handlersType")}function pt(e){e||_("initialIsRequired"),H(e)||_("initialType"),ut(e)&&_("initialContent")}function ht(e,t){throw new Error(e[t]||e.default)}var gt={initialIsRequired:"initial state is required",initialType:"initial state should be an object",initialContent:"initial state shouldn't be an empty object",handlerType:"handler should be an object or a function",handlersType:"all handlers should be a functions",selectorType:"selector should be a function",changeType:"provided value of changes should be an object",changeField:'it seams you want to change a field in the state which is not specified in the "initial" state',default:"an unknown error accured in `state-local` package"},_=k(ht)(gt),z={changes:lt,selector:ft,handler:dt,initial:pt};function mt(e){var t=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{};z.initial(e),z.handler(t);var r={current:e},n=k(wt)(r,t),i=k(bt)(r),o=k(z.changes)(e),a=k(vt)(r);function u(){var p=arguments.length>0&&arguments[0]!==void 0?arguments[0]:function(O){return O};return z.selector(p),p(r.current)}function d(p){ct(n,i,o,a)(p)}return[u,d]}function vt(e,t){return q(t)?t(e.current):t}function bt(e,t){return e.current=he(he({},e.current),t),t}function wt(e,t,r){return q(t)?t(e.current):Object.keys(r).forEach(function(n){var i;return(i=t[n])===null||i===void 0?void 0:i.call(t,e.current[n])}),r}var jt={create:mt},yt={paths:{vs:"https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs"}};function Ot(e){return function t(){for(var r=this,n=arguments.length,i=new Array(n),o=0;o<n;o++)i[o]=arguments[o];return i.length>=e.length?e.apply(this,i):function(){for(var a=arguments.length,u=new Array(a),d=0;d<a;d++)u[d]=arguments[d];return t.apply(r,[].concat(i,u))}}}function Mt(e){return{}.toString.call(e).includes("Object")}function Ct(e){return e||ge("configIsRequired"),Mt(e)||ge("configType"),e.urls?(St(),{paths:{vs:e.urls.monacoBase}}):e}function St(){console.warn(we.deprecation)}function _t(e,t){throw new Error(e[t]||e.default)}var we={configIsRequired:"the configuration object is required",configType:"the configuration object should be an object",default:"an unknown error accured in `@monaco-editor/loader` package",deprecation:`Deprecation warning!
    You are using deprecated way of configuration.

    Instead of using
      monaco.config({ urls: { monacoBase: '...' } })
    use
      monaco.config({ paths: { vs: '...' } })

    For more please check the link https://github.com/suren-atoyan/monaco-loader#config
  `},ge=Ot(_t)(we),Et={config:Ct},Pt=function(){for(var t=arguments.length,r=new Array(t),n=0;n<t;n++)r[n]=arguments[n];return function(i){return r.reduceRight(function(o,a){return a(o)},i)}};function je(e,t){return Object.keys(t).forEach(function(r){t[r]instanceof Object&&e[r]&&Object.assign(t[r],je(e[r],t[r]))}),fe(fe({},e),t)}var Rt={type:"cancelation",msg:"operation is manually canceled"};function te(e){var t=!1,r=new Promise(function(n,i){e.then(function(o){return t?i(Rt):n(o)}),e.catch(i)});return r.cancel=function(){return t=!0},r}var Tt=jt.create({config:yt,isInitialized:!1,resolve:null,reject:null,monaco:null}),ye=tt(Tt,2),D=ye[0],B=ye[1];function xt(e){var t=Et.config(e),r=t.monaco,n=et(t,["monaco"]);B(function(i){return{config:je(i.config,n),monaco:r}})}function It(){var e=D(function(t){var r=t.monaco,n=t.isInitialized,i=t.resolve;return{monaco:r,isInitialized:n,resolve:i}});if(!e.isInitialized){if(B({isInitialized:!0}),e.monaco)return e.resolve(e.monaco),te(re);if(window.monaco&&window.monaco.editor)return Oe(window.monaco),e.resolve(window.monaco),te(re);Pt(Nt,Lt)($t)}return te(re)}function Nt(e){return document.body.appendChild(e)}function At(e){var t=document.createElement("script");return e&&(t.src=e),t}function Lt(e){var t=D(function(n){var i=n.config,o=n.reject;return{config:i,reject:o}}),r=At("".concat(t.config.paths.vs,"/loader.js"));return r.onload=function(){return e()},r.onerror=t.reject,r}function $t(){var e=D(function(r){var n=r.config,i=r.resolve,o=r.reject;return{config:n,resolve:i,reject:o}}),t=window.require;t.config(e.config),t(["vs/editor/editor.main"],function(r){Oe(r),e.resolve(r)},function(r){e.reject(r)})}function Oe(e){D().monaco||B({monaco:e})}function kt(){return D(function(e){var t=e.monaco;return t})}var re=new Promise(function(e,t){return B({resolve:e,reject:t})}),Me={config:xt,init:It,__getMonacoInstance:kt},Vt={wrapper:{display:"flex",position:"relative",textAlign:"initial"},fullWidth:{width:"100%"},hide:{display:"none"}},ne=Vt,qt={container:{display:"flex",height:"100%",width:"100%",justifyContent:"center",alignItems:"center"}},Dt=qt;function Ft({children:e}){return R.createElement("div",{style:Dt.container},e)}var Wt=Ft,zt=Wt;function Ut({width:e,height:t,isEditorReady:r,loading:n,_ref:i,className:o,wrapperProps:a}){return R.createElement("section",{style:{...ne.wrapper,width:e,height:t},...a},!r&&R.createElement(zt,null,n),R.createElement("div",{ref:i,style:{...ne.fullWidth,...!r&&ne.hide},className:o}))}var Ht=Ut,Ce=c.memo(Ht);function Bt(e){c.useEffect(e,[])}var Se=Bt;function Gt(e,t,r=!0){let n=c.useRef(!0);c.useEffect(n.current||!r?()=>{n.current=!1}:e,t)}var y=Gt;function V(){}function P(e,t,r,n){return Kt(e,n)||Yt(e,t,r,n)}function Kt(e,t){return e.editor.getModel(_e(e,t))}function Yt(e,t,r,n){return e.editor.createModel(t,r,n?_e(e,n):void 0)}function _e(e,t){return e.Uri.parse(t)}function Jt({original:e,modified:t,language:r,originalLanguage:n,modifiedLanguage:i,originalModelPath:o,modifiedModelPath:a,keepCurrentOriginalModel:u=!1,keepCurrentModifiedModel:d=!1,theme:p="light",loading:O="Loading...",options:M={},height:T="100%",width:x="100%",className:G,wrapperProps:K={},beforeMount:Y=V,onMount:J=V}){let[j,I]=c.useState(!1),[N,g]=c.useState(!0),m=c.useRef(null),h=c.useRef(null),A=c.useRef(null),b=c.useRef(J),s=c.useRef(Y),E=c.useRef(!1);Se(()=>{let l=Me.init();return l.then(v=>(h.current=v)&&g(!1)).catch(v=>v?.type!=="cancelation"&&console.error("Monaco initialization: error:",v)),()=>m.current?L():l.cancel()}),y(()=>{if(m.current&&h.current){let l=m.current.getOriginalEditor(),v=P(h.current,e||"",n||r||"text",o||"");v!==l.getModel()&&l.setModel(v)}},[o],j),y(()=>{if(m.current&&h.current){let l=m.current.getModifiedEditor(),v=P(h.current,t||"",i||r||"text",a||"");v!==l.getModel()&&l.setModel(v)}},[a],j),y(()=>{let l=m.current.getModifiedEditor();l.getOption(h.current.editor.EditorOption.readOnly)?l.setValue(t||""):t!==l.getValue()&&(l.executeEdits("",[{range:l.getModel().getFullModelRange(),text:t||"",forceMoveMarkers:!0}]),l.pushUndoStop())},[t],j),y(()=>{m.current?.getModel()?.original.setValue(e||"")},[e],j),y(()=>{let{original:l,modified:v}=m.current.getModel();h.current.editor.setModelLanguage(l,n||r||"text"),h.current.editor.setModelLanguage(v,i||r||"text")},[r,n,i],j),y(()=>{h.current?.editor.setTheme(p)},[p],j),y(()=>{m.current?.updateOptions(M)},[M],j);let F=c.useCallback(()=>{if(!h.current)return;s.current(h.current);let l=P(h.current,e||"",n||r||"text",o||""),v=P(h.current,t||"",i||r||"text",a||"");m.current?.setModel({original:l,modified:v})},[r,t,i,e,n,o,a]),W=c.useCallback(()=>{!E.current&&A.current&&(m.current=h.current.editor.createDiffEditor(A.current,{automaticLayout:!0,...M}),F(),h.current?.editor.setTheme(p),I(!0),E.current=!0)},[M,p,F]);c.useEffect(()=>{j&&b.current(m.current,h.current)},[j]),c.useEffect(()=>{!N&&!j&&W()},[N,j,W]);function L(){let l=m.current?.getModel();u||l?.original?.dispose(),d||l?.modified?.dispose(),m.current?.dispose()}return R.createElement(Ce,{width:x,height:T,isEditorReady:j,loading:O,_ref:A,className:G,wrapperProps:K})}var Qt=Jt;c.memo(Qt);function Xt(e){let t=c.useRef();return c.useEffect(()=>{t.current=e},[e]),t.current}var Zt=Xt,U=new Map;function er({defaultValue:e,defaultLanguage:t,defaultPath:r,value:n,language:i,path:o,theme:a="light",line:u,loading:d="Loading...",options:p={},overrideServices:O={},saveViewState:M=!0,keepCurrentModel:T=!1,width:x="100%",height:G="100%",className:K,wrapperProps:Y={},beforeMount:J=V,onMount:j=V,onChange:I,onValidate:N=V}){let[g,m]=c.useState(!1),[h,A]=c.useState(!0),b=c.useRef(null),s=c.useRef(null),E=c.useRef(null),F=c.useRef(j),W=c.useRef(J),L=c.useRef(),l=c.useRef(n),v=Zt(o),ae=c.useRef(!1),Q=c.useRef(!1);Se(()=>{let w=Me.init();return w.then(S=>(b.current=S)&&A(!1)).catch(S=>S?.type!=="cancelation"&&console.error("Monaco initialization: error:",S)),()=>s.current?Pe():w.cancel()}),y(()=>{let w=P(b.current,e||n||"",t||i||"",o||r||"");w!==s.current?.getModel()&&(M&&U.set(v,s.current?.saveViewState()),s.current?.setModel(w),M&&s.current?.restoreViewState(U.get(o)))},[o],g),y(()=>{s.current?.updateOptions(p)},[p],g),y(()=>{!s.current||n===void 0||(s.current.getOption(b.current.editor.EditorOption.readOnly)?s.current.setValue(n):n!==s.current.getValue()&&(Q.current=!0,s.current.executeEdits("",[{range:s.current.getModel().getFullModelRange(),text:n,forceMoveMarkers:!0}]),s.current.pushUndoStop(),Q.current=!1))},[n],g),y(()=>{let w=s.current?.getModel();w&&i&&b.current?.editor.setModelLanguage(w,i)},[i],g),y(()=>{u!==void 0&&s.current?.revealLine(u)},[u],g),y(()=>{b.current?.editor.setTheme(a)},[a],g);let ce=c.useCallback(()=>{if(!(!E.current||!b.current)&&!ae.current){W.current(b.current);let w=o||r,S=P(b.current,n||e||"",t||i||"",w||"");s.current=b.current?.editor.create(E.current,{model:S,automaticLayout:!0,...p},O),M&&s.current.restoreViewState(U.get(w)),b.current.editor.setTheme(a),u!==void 0&&s.current.revealLine(u),m(!0),ae.current=!0}},[e,t,r,n,i,o,p,O,M,a,u]);c.useEffect(()=>{g&&F.current(s.current,b.current)},[g]),c.useEffect(()=>{!h&&!g&&ce()},[h,g,ce]),l.current=n,c.useEffect(()=>{g&&I&&(L.current?.dispose(),L.current=s.current?.onDidChangeModelContent(w=>{Q.current||I(s.current.getValue(),w)}))},[g,I]),c.useEffect(()=>{if(g){let w=b.current.editor.onDidChangeMarkers(S=>{let X=s.current.getModel()?.uri;if(X&&S.find(Z=>Z.path===X.path)){let Z=b.current.editor.getModelMarkers({resource:X});N?.(Z)}});return()=>{w?.dispose()}}return()=>{}},[g,N]);function Pe(){L.current?.dispose(),T?M&&U.set(o,s.current.saveViewState()):s.current.getModel()?.dispose(),s.current.dispose()}return R.createElement(Ce,{width:x,height:G,isEditorReady:g,loading:d,_ref:E,className:K,wrapperProps:Y})}var tr=er,rr=c.memo(tr),nr=rr;const me=[-10,10],ir=({doStart:e})=>{const[t,r]=Qe(new oe),n=c.useRef(null),i=[];for(let a=me[0];a<=me[1];a++)i.push(f.jsxs("div",{className:ee.tapeCell,children:[f.jsx("label",{htmlFor:"inputTape"+a,children:a}),f.jsx("input",{id:"inputTape"+a,value:t.get(a),onFocus:u=>{u.target.select()},autoComplete:"off",onChange:u=>{u.preventDefault(),r(d=>{d.set(a,u.target.value)})}})]},a));const o=c.useCallback(()=>{n.current!==null&&e([n.current.getValue(),t,1e4],!1)},[t]);return f.jsxs("div",{className:ee.startContainer,children:[f.jsx("div",{className:ee.tapeContainer,children:i}),f.jsx(nr,{height:"300px",onMount:a=>n.current=a,defaultValue:`start: s
accept: ac
reject: rj
s _ -> ac _ ^
s 0 -> n _ >
n 0 -> s _ >
n _ -> rj _ >`}),f.jsx("button",{onClick:o,children:"Start"})]})},or=e=>{const t=e.split(/\r?\n/);let r=0,n,i,o;for(;r<t.length;){if(t[r].startsWith("#")||t[r]===""){r++;continue}const u=t[r].toLowerCase().match(/(start|accept|reject|blank): (.+)/);if(u===null)break;const[d,p,O]=u;p==="start"?n=O:p==="accept"?i=O:p==="reject"&&(o=O),r++}const a=[];for(;r<t.length;){if(t[r].startsWith("#")||t[r]===""){r++;continue}const u=t[r].toLowerCase().match(/^([^ ]+) ([^ ]+) -> ([^ ]+) ([^ ]+) (\^|<|>)$/);if(u===null)throw new Error("Cannot parse line "+r+": "+t[r]);const[d,p,O,M,T,x]=u;a.push({curState:p,curTape:O,newState:M,newTape:T,action:x,lineNumber:r,fullString:t[r]}),r++}if(n===void 0)throw new Error("No start state found.");if(i===void 0)throw new Error("No accept state found.");if(o===void 0)throw new Error("No reject state found.");return{start:n,accept:i,reject:o,rules:a}},ar=async(e,t,r=1e4)=>{const n=or(e),i=t.copy(),o={status:"running",description:"Machine is running",state:n.start,curPosition:0,curStep:0};for(ve("machineState",o),ve("tape",i);;){if(o.curStep>r){o.status="halted",o.description="Maximum number of steps reached";break}else if(o.state===n.accept){o.status="halted",o.description="Machine accepted the input tape.";break}else if(o.state===n.reject){o.status="halted",o.description="Machine rejected the input tape.";break}let a=null;for(const u of n.rules)if(o.state===u.curState&&i.get(o.curPosition)===u.curTape){if(a!==null)throw new Error("Two rules match this state.");a=u}if(await ie("fetch",a),a===null){o.status="halted",o.state=n.reject,o.description="Machine couldn't find rule for this state, so it rejected";break}i.set(o.curPosition,a.newTape),o.state=a.newState,a.action===">"?o.curPosition++:a.action==="<"&&o.curPosition--,await ie("execute",a)}await ie("done")},Ee={algo:ar,startComponent:ir,renderComponent:Ke},{bind:ve,here:ie,store:cr}=Ie(Ee);Ne();document.getElementById("root");Ae.createRoot(document.getElementById("root")).render(f.jsx(c.StrictMode,{children:f.jsx(Le,{manifest:Ee,store:cr})}));
