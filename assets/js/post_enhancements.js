(function(){
  'use strict';

  /* === KaTeX auto-render === */
  function initKaTeX(){
    if(typeof renderMathInElement!=='function') return;
    var c=document.querySelector('.blog-post-content');
    if(!c) return;
    try{
      renderMathInElement(c,{
        delimiters:[
          {left:'$$',right:'$$',display:true},
          {left:'\\[',right:'\\]',display:true},
          {left:'\\(',right:'\\)',display:false},
          {left:'$',right:'$',display:false}
        ],
        ignoredTags:['script','noscript','style','textarea','pre','code'],
        throwOnError:false,
        strict:'ignore',
        macros:{'\\RR':'\\mathbb{R}','\\NN':'\\mathbb{N}','\\ZZ':'\\mathbb{Z}','\\QQ':'\\mathbb{Q}'}
      });
    }catch(e){/* silent */}
  }

  /* === Slugify heading text for IDs === */
  function slugify(text){
    return text.toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff-]/g,'')
      .replace(/\s+/g,'-')
      .replace(/^-+|-+$/g,'')
      || 'section';
  }

  /* === TOC generation + heading anchors === */
  function initTOC(){
    var content=document.querySelector('.blog-post-content');
    if(!content) return;

    var headings=content.querySelectorAll('h2, h3');
    if(headings.length<2){
      var sidebar=document.getElementById('blog-toc-sidebar');
      var mobile=document.getElementById('blog-toc-mobile');
      if(sidebar) sidebar.style.display='none';
      if(mobile) mobile.style.display='none';
      return;
    }

    var desktopList=document.getElementById('blog-toc-list');
    var mobileList=document.getElementById('blog-toc-list-mobile');
    var usedIds={};

    headings.forEach(function(h){
      // Generate unique ID
      var base=slugify(h.textContent);
      var id=base;
      var n=1;
      while(usedIds[id]){id=base+'-'+(++n);}
      usedIds[id]=true;
      h.id=id;

      // Make heading position relative for anchor
      h.style.position='relative';

      // Insert anchor link
      var anchor=document.createElement('a');
      anchor.className='blog-heading-anchor';
      anchor.href='#'+id;
      anchor.setAttribute('aria-label','Link to '+h.textContent);
      anchor.innerHTML='<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" opacity="0.4"><path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"/></svg>';
      anchor.addEventListener('click',function(e){
        e.preventDefault();
        history.replaceState(null,'',anchor.href);
        h.scrollIntoView({behavior:'smooth',block:'start'});
        // Copy link
        if(navigator.clipboard){
          navigator.clipboard.writeText(window.location.origin+window.location.pathname+'#'+id).catch(function(){});
        }
      });
      h.insertBefore(anchor,h.firstChild);

      // Build TOC items
      var isH3=h.tagName==='H3';
      var li=document.createElement('li');
      if(isH3) li.style.paddingLeft='0.75rem';
      var a=document.createElement('a');
      a.href='#'+id;
      a.textContent=h.textContent;
      a.className='block py-1 text-gray-500 hover:text-primary transition-colors duration-150 no-underline';
      a.style.textDecoration='none';
      if(isH3) a.style.fontSize='0.8125rem';
      a.setAttribute('data-toc-id',id);
      a.addEventListener('click',function(e){
        e.preventDefault();
        h.scrollIntoView({behavior:'smooth',block:'start'});
        history.replaceState(null,'','#'+id);
      });
      li.appendChild(a);

      if(desktopList) desktopList.appendChild(li.cloneNode(true));
      if(mobileList) mobileList.appendChild(li);
    });

    // Attach click handlers on cloned desktop list
    if(desktopList){
      desktopList.querySelectorAll('a[data-toc-id]').forEach(function(a){
        a.addEventListener('click',function(e){
          e.preventDefault();
          var target=document.getElementById(a.getAttribute('data-toc-id'));
          if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
          history.replaceState(null,'','#'+a.getAttribute('data-toc-id'));
        });
      });
    }

    // IntersectionObserver for active heading
    if('IntersectionObserver' in window){
      var allLinks=document.querySelectorAll('[data-toc-id]');
      var observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            allLinks.forEach(function(l){l.classList.remove('blog-toc-active','text-primary','font-semibold');});
            allLinks.forEach(function(l){
              if(l.getAttribute('data-toc-id')===entry.target.id){
                l.classList.add('blog-toc-active','text-primary','font-semibold');
              }
            });
          }
        });
      },{rootMargin:'-80px 0px -70% 0px',threshold:0});

      headings.forEach(function(h){observer.observe(h);});
    }
  }

  /* === Wrap tables in scrollable containers === */
  function initTables(){
    var c=document.querySelector('.blog-post-content');
    if(!c) return;
    var tables=c.querySelectorAll('table');
    tables.forEach(function(t){
      var wrapper=document.createElement('div');
      wrapper.className='blog-table-scroll';
      t.parentNode.insertBefore(wrapper,t);
      wrapper.appendChild(t);
    });
  }

  /* === Init === */
  function init(){
    initTables();
    initKaTeX();
    initTOC();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  } else {
    setTimeout(init,0);
  }
})();
