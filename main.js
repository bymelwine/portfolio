/* Progressive, local-only, dependency-free portfolio interactions. */
(() => {
  'use strict';
  const data = window.PORTFOLIO_DATA;
  const media = window.PORTFOLIO_MEDIA;
  const state = { lang: 'fr', detailed: false };
  const $ = (sel,root=document) => root.querySelector(sel);
  const el = (tag, cls='', value=null) => {
    const node = document.createElement(tag);
    if(cls) node.className=cls;
    if(value!==null) node.textContent=value;
    return node;
  };
  const tr = key => data.labels[state.lang][key];
  const langValue = (fr,en) => state.lang==='fr' ? fr : en;
  const add = (parent,...items) => { items.forEach(i=>parent.appendChild(i)); return parent; };
  const tools = arr => {
    const wrap=el('div','tag-list');
    for (const item of arr) add(wrap,el('span','tag',item));
    return wrap;
  };
  const labelOf = row => state.lang==='fr'?row[1]:row[2];
  const getText = p => p[state.lang];
  const projectById = id => data.projects.find(p=>p.id===id);
  const dialog=$('#image-dialog'), dialogImg=$('#dialog-image');
  function openVisual(asset,caption){
    if(!media[asset]) return;
    const m=media[asset];
    dialogImg.src=m.src;
    dialogImg.alt=caption;
    $('#dialog-title').textContent=tr('projectGallery');
    $('#dialog-caption').textContent=caption;
    if(!dialog.open) dialog.showModal();
    $('#dialog-close').focus();
  }
  $('#dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',ev=>{if(ev.target===dialog) dialog.close();});
  dialog.addEventListener('close',()=>{dialogImg.removeAttribute('src');});

  function figure(row,hero=false){
    const [asset]=row,m=media[asset],caption=labelOf(row);
    if(!m) return null;
    const figure=el('figure',hero?'case-thumbnail':'gallery-item');
    const button=el('button',hero?'gallery-trigger cover-trigger':'gallery-trigger');
    button.type='button';
    button.setAttribute('aria-label',tr('projectViewImage')+' — '+caption);
    const image=el('img'); image.src=m.src;image.alt=caption;image.width=m.width;image.height=m.height;image.loading='lazy';image.decoding='async';
    add(button,image);
    if(hero) add(button,el('span','image-zoom-icon','↗ '+langValue('Agrandir','Expand')));
    button.addEventListener('click',()=>openVisual(asset,caption));
    add(figure,button);
    const figcaption=el('figcaption',hero?'cover-caption':'',caption);
    add(figure,figcaption);
    return figure;
  }
  function info(title,body){
    const box=el('div','case-info');
    add(box,el('h4','',title));
    if(Array.isArray(body)){
      const list=el('ul');body.forEach(x=>add(list,el('li','',x)));add(box,list);
    }else add(box,el('p','',body));
    return box;
  }
  function galleryBlock(p){
    const block=el('div','case-info gallery-block');add(block,el('h4','',tr('projectGallery')));
    if(p.images.length){const g=el('div','gallery');p.images.forEach(r=>{const f=figure(r);if(f) add(g,f);});add(block,g);}
    else add(block,el('p','',tr('projectNoVisual')));
    return block;
  }
  function workflow(){
    const steps=state.lang==='fr'?
      [['01 Demande','Le technicien demande un accès RDP ou SSH à une ressource définie.'],['02 Identité','WALLIX utilise l’annuaire et les rôles configurés pour identifier le demandeur.'],['03 Approbation','Un approbateur examine puis valide ou refuse l’accès.'],['04 Session','Après validation, la session est ouverte à travers le bastion, sans accès direct depuis le poste client.'],['05 Audit','WALLIX enregistre les événements. Une session peut être interrompue ou un droit révoqué.']]:
      [['01 Request','The technician requests RDP or SSH access to a configured target.'],['02 Identity','WALLIX uses the directory and role assignments to identify the requester.'],['03 Approval','An approver reviews the request and approves or rejects it.'],['04 Session','After approval, the session runs through the bastion, not through a direct client connection.'],['05 Audit','WALLIX records the activity; a session can be terminated or permission revoked.']];
    const block=el('div','case-info workflow-block');
    const wrap=el('div','workflow');
    add(wrap,el('h4','',langValue('Workflow WALLIX — explorer les étapes','WALLIX workflow — explore the steps')));
    const controls=el('div','workflow-steps');const descr=el('p','workflow-description',steps[0][1]);descr.setAttribute('aria-live','polite');
    steps.forEach((step,i)=>{const button=el('button','',step[0]);button.type='button';button.setAttribute('aria-pressed',String(i===0));button.addEventListener('click',()=>{controls.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===button)));descr.textContent=step[1];});add(controls,button);});
    add(wrap,controls,descr);add(block,wrap);return block;
  }
  function caseBody(p){
    const c=getText(p);const body=el('div','case-body');
    add(body,info(tr('projectContext'),c.context),info(tr('projectMethod'),c.steps),info(tr('projectLearning'),c.learning),info(tr('projectLimits'),c.limits));
    if(p.id==='wallix') add(body,workflow());
    add(body,galleryBlock(p));
    if(p.repo && p.featured){const container=el('div','case-info repo-block'); const a=el('a','text-link',tr('repoProject')); a.href=p.repo;a.target='_blank';a.rel='noopener noreferrer'; add(container,a);add(body,container);}
    return body;
  }
  function createCase(p){
    const c=getText(p),wrap=el('article','featured-card');wrap.id='case-'+p.id;
    const overview=el('div','case-overview');
    const cover=figure(p.images[0],true);if(cover)add(overview,cover);
    const copy=el('div','case-copy');
    add(copy,el('p','case-kicker',`${p.number} / ${p.kind==='stage'?tr('projectTypeStage'):tr('projectTypeAcademic')} · ${langValue(p.period,p.periodEN)}`),el('h3','',c.title),el('p','case-tagline',c.tagline),el('p','case-summary',c.summary),tools(p.tools.slice(0,7)));
    add(overview,copy);add(wrap,overview);
    const details=el('details','case-details');details.open=state.detailed;
    const summary=el('summary','',tr('projectExpand'));
    details.addEventListener('toggle',()=>summary.textContent=details.open?tr('projectCollapse'):tr('projectExpand'));
    add(details,summary,caseBody(p));add(wrap,details);
    return wrap;
  }
  function createSmallCard(p){
    const c=getText(p),card=el('article','more-card');card.id='case-'+p.id;
    if(p.images.length){
      const row=p.images[0],m=media[row[0]],coverWrap=el('figure','more-card-figure'),cover=el('button','more-card-cover');
      cover.type='button';cover.setAttribute('aria-label',tr('projectViewImage')+' — '+labelOf(row));
      const img=el('img');img.loading='lazy';img.decoding='async';img.src=m.src;img.alt=labelOf(row);img.width=m.width;img.height=m.height;
      add(cover,img);cover.addEventListener('click',()=>openVisual(row[0],labelOf(row)));
      add(coverWrap,cover,el('figcaption','more-card-caption',labelOf(row)));
      add(card,coverWrap);
    }
    else add(card,el('div','empty-media','{ }  '+langValue('LAB DOCUMENTÉ','DOCUMENTED LAB')));
    const content=el('div','more-card-body');
    add(content,el('p','card-eyebrow',`${langValue(p.period,p.periodEN)} · ${p.kind==='personal'?tr('projectTypePersonal'):tr('projectTypeAcademic')}`),el('h3','',c.title),el('p','',c.summary),tools(p.tools.slice(0,5)));
    const details=el('details'),summary=el('summary','',tr('projectOpen'));details.open=state.detailed;
    details.addEventListener('toggle',()=>summary.textContent=details.open?tr('projectClose'):tr('projectOpen'));
    add(details,summary,caseBody(p));add(content,details);
    if(p.repo){const link=el('a','text-link',tr('repoProject'));link.href=p.repo;link.target='_blank';link.rel='noopener noreferrer';link.style.marginTop='12px';add(content,link);}
    add(card,content);return card;
  }
  function renderProjects(){
    const featured=$('#featured-projects'), more=$('#more-projects');featured.replaceChildren();more.replaceChildren();
    data.projects.forEach(p=>add(p.featured?featured:more,p.featured?createCase(p):createSmallCard(p)));
  }
  function renderExperience(){
    const root=$('#experience-list');root.replaceChildren();
    data.projects.filter(p=>p.kind==='stage').forEach(p=>{
      const c=getText(p),row=el('article','timeline-item');
      add(row,el('div','timeline-date',langValue(p.period,p.periodEN)));
      const body=el('div');add(body,el('h3','',p.organization),el('p','',c.summary));
      const a=el('a','text-link',tr('experienceLink'));a.href='#case-'+p.id;add(body,a);add(row,body);add(root,row);
    });
  }
  function renderSkills(){
    const root=$('#skills-grid');root.replaceChildren();
    data.skills.forEach(item=>{
      const [title,description,tech,proof]=item[state.lang];
      const card=el('article','skill-card');
      add(card,el('h3','',title),el('p','',description),el('div','skill-tools',tech));
      const wrap=el('div','skill-links');
      const links=item.links || [{fr:proof,en:proof,href:'#case-'+item.anchor}];
      links.forEach(link=>{
        const text=state.lang==='fr'?link.fr:link.en;
        const a=el('a','text-link',text+' ↗');
        a.href=link.href;
        if(/^https?:\/\//.test(link.href)){
          a.target='_blank';a.rel='noopener noreferrer';
        }
        add(wrap,a);
      });
      add(card,wrap);add(root,card);
    });
  }
  function renderCerts(){
    const root=$('#cert-grid');root.replaceChildren();
    data.certifications.forEach(c=>{
      const card=el('article','cert-card'),visual=el(c.link?'a':'div','cert-artwork'),copy=el('div','cert-copy');
      if(c.link){visual.href=c.link;visual.target='_blank';visual.rel='noopener noreferrer';visual.setAttribute('aria-label',c.kind==='course'?langValue('Voir le certificat de formation : ','View course certificate: ')+c.name:langValue('Consulter le badge sur Credly : ','View badge on Credly: ')+c.name);}
      if(c.icon){
        const logo=el('img');logo.src=c.icon;logo.alt=(c.kind==='course'?langValue('Illustration de l’attestation de formation ','Course certificate preview: '):langValue('Visuel du badge ','Badge artwork: '))+c.name;
        logo.width=170;logo.height=150;logo.loading='lazy';logo.decoding='async';add(visual,logo);
      } else {visual.textContent=c.initials;}
      add(copy,el('p','cert-issuer',c.issuer),el('h3','',c.name),el('p','cert-date',langValue(c.dateFR,c.dateEN)));
      if(c.link){const a=el('a','text-link',c.kind==='course'?langValue('Voir le certificat ↗','View course certificate ↗'):tr('checkCredential'));a.href=c.link;a.target='_blank';a.rel='noopener noreferrer';add(copy,a);}
      add(card,visual,copy);add(root,card);
    });
    const edu=$('#education-list');edu.replaceChildren();
    data.education.forEach(e=>{
      const row=el('div','edu-item');
      const info=el('div');
      add(row,el('span','',e.date));
      add(info,el('strong','',e[state.lang]),el('small','',e.place));
      if(e.modules && e.modules[state.lang]){
        const container=el('div','edu-modules');
        e.modules[state.lang].forEach(group=>{
          const paragraph=el('p','edu-module');
          add(paragraph,el('span','edu-module-label',group.title+' : '),el('span','edu-module-content',group.items));
          add(container,paragraph);
        });
        add(info,container);
      }
      add(row,info);
      add(edu,row);
    });
  }
  function translateStatic(){document.documentElement.lang=state.lang;
    document.querySelectorAll('[data-i18n]').forEach(node=>{const key=node.dataset.i18n;if(tr(key)) node.textContent=tr(key);});
    document.title=state.lang==='fr'?'Melwine LANKOANDE · Portfolio Cybersécurité | PFE 2027':'Melwine LANKOANDE · Cybersecurity Portfolio | 2027 Internship';
    $('meta[name="description"]').content=state.lang==='fr'?"Portfolio de Melwine LANKOANDE : stages, projets et réalisations en cybersécurité. Recherche de stage PFE dès janvier 2027.":'Melwine LANKOANDE cybersecurity portfolio: internships, technical projects and hands-on work. Seeking a final-year internship from January 2027.';
    const b=$('#language-toggle');b.textContent=state.lang==='fr'?'EN':'FR';b.setAttribute('aria-label',state.lang==='fr'?'Switch to English':'Passer en français');
    $('.main-nav').setAttribute('aria-label',langValue('Navigation principale','Main navigation'));
    $('.brand').setAttribute('aria-label',langValue('Melwine LANKOANDE — accueil','Melwine LANKOANDE — home'));
    $('#dialog-close').setAttribute('aria-label',langValue('Fermer l’image','Close image'));
    $('.reader-switch').setAttribute('aria-label',langValue('Niveau de lecture','Reading level'));
    $('.portrait-halo img').alt=langValue('Portrait professionnel de Melwine LANKOANDE','Professional portrait of Melwine LANKOANDE');
    const dark=document.documentElement.dataset.theme==='dark';
    $('#theme-toggle').setAttribute('aria-label',dark?langValue('Activer le mode clair','Switch to light mode'):langValue('Activer le mode sombre','Switch to dark mode'));
  }
  function render(){translateStatic();renderProjects();renderExperience();renderSkills();renderCerts();syncReader();}
  function syncReader(){
    $('#quick-button').classList.toggle('active',!state.detailed);$('#deep-button').classList.toggle('active',state.detailed);
    $('#quick-button').setAttribute('aria-pressed',String(!state.detailed));$('#deep-button').setAttribute('aria-pressed',String(state.detailed));
  }
  function setReading(detailed){state.detailed=detailed;
    document.querySelectorAll('.case-details,.more-card details').forEach(d=>d.open=detailed);
    syncReader();
  }
  $('#quick-button').addEventListener('click',()=>setReading(false));
  $('#deep-button').addEventListener('click',()=>setReading(true));
  $('#language-toggle').addEventListener('click',()=>{state.lang=state.lang==='fr'?'en':'fr';render();});
  const themeButton=$('#theme-toggle');
  const safeStore=(key,value)=>{try{localStorage.setItem(key,value);}catch(_){/* Private browsing. */}};
  let savedTheme=null;try{savedTheme=localStorage.getItem('portfolio-theme');}catch(_){}
  const prefersDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme=['light','dark'].includes(savedTheme)?savedTheme:(prefersDark?'dark':'light');
  function setTheme(mode){document.documentElement.dataset.theme=mode;
    themeButton.setAttribute('aria-label',mode==='dark'?langValue('Activer le mode clair','Switch to light mode'):langValue('Activer le mode sombre','Switch to dark mode'));
    document.querySelector('meta[name="theme-color"]').content=mode==='dark'?'#0a1323':'#0e1b32';
    safeStore('portfolio-theme',mode);
  }
  themeButton.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
  // Email is intentionally assembled at runtime: not present as a clear address in HTML.
  const mail=[109,101,108,119,105,110,101,108,97,110,107,64,103,109,97,105,108,46,99,111,109];
  const address=String.fromCharCode(...mail);
  $('#email-link').href='mailto:'+address+'?subject='+encodeURIComponent('Stage PFE cybersécurité 2027');
  $('#year').textContent=String(new Date().getFullYear());
  setTheme(initialTheme);render();
})();
