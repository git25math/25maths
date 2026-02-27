(function(){
  'use strict';

  var isZH=document.documentElement.lang==='zh-CN';
  var pagePath=window.location.pathname;

  function pushEvent(event,data){
    try{
      window.dataLayer=window.dataLayer||[];
      var payload={event:event,page_lang:document.documentElement.lang,page_path:pagePath};
      if(data){for(var k in data){if(data.hasOwnProperty(k))payload[k]=data[k];}}
      window.dataLayer.push(payload);
    }catch(e){/* silent */}
  }

  /* === Inline CTAs === */
  function insertInlineCTAs(){
    var content=document.querySelector('.blog-post-content');
    if(!content) return;

    var paragraphs=content.querySelectorAll(':scope > p');
    if(paragraphs.length<6) return; // too short for inline CTAs

    var positions=[Math.floor(paragraphs.length*0.33),Math.floor(paragraphs.length*0.75)];
    var ctaTexts=isZH?[
      {title:'想要更多练习？',text:'浏览我们的考试专题练习，提升做题准确率。',link:'/zh-cn/exercises/',btn:'去看练习'},
      {title:'准备好了吗？',text:'获取学期练习通行证，12 周系统复习。',link:'/zh-cn/subscription.html',btn:'了解通行证'}
    ]:[
      {title:'Want more practice?',text:'Browse our exam-focused exercises to build accuracy.',link:'/exercises/',btn:'Explore exercises'},
      {title:'Ready for structured practice?',text:'Get the Term Practice Pass — 12 weekly packs with full solutions.',link:'/subscription.html',btn:'Get Term Pass'}
    ];

    var utm='?utm_source=blog&utm_medium=inline_cta&utm_campaign='+encodeURIComponent(pagePath);

    positions.forEach(function(pos,i){
      if(pos>=paragraphs.length) return;
      var cta=ctaTexts[i];
      if(!cta) return;

      var aside=document.createElement('aside');
      aside.className='blog-inline-cta';
      aside.innerHTML='<p class="font-semibold text-gray-900 mb-1" style="margin-top:0">'+cta.title+'</p>'+
        '<p class="text-sm text-gray-600 mb-2" style="margin-top:0.25rem">'+cta.text+'</p>'+
        '<a href="'+cta.link+utm+'" class="blog-cta-link text-sm font-semibold text-primary hover:underline">'+cta.btn+' →</a>';

      paragraphs[pos].parentNode.insertBefore(aside,paragraphs[pos].nextSibling);
    });
  }

  /* === "Next Steps" module === */
  function insertNextSteps(){
    var waitlistCTA=document.querySelector('.mt-12.border-t.pt-8');
    if(!waitlistCTA) return;

    var steps=isZH?[
      {icon:'📝',title:'互动练习',desc:'即时反馈训练，边做边学。',link:'/zh-cn/exercises/'},
      {icon:'📊',title:'考纲分析',desc:'了解 CIE 和 Edexcel 考纲重点。',link:'/zh-cn/cie0580/'},
      {icon:'📦',title:'每周练习包',desc:'12 周系统化练习，含完整解析。',link:'/zh-cn/subscription.html'}
    ]:[
      {icon:'📝',title:'Interactive exercises',desc:'Instant feedback drills to build accuracy.',link:'/exercises/'},
      {icon:'📊',title:'Exam board guides',desc:'See topic breakdowns for CIE and Edexcel.',link:'/cie0580/'},
      {icon:'📦',title:'Weekly practice packs',desc:'12-week structured practice with full solutions.',link:'/subscription.html'}
    ];

    var utm='?utm_source=blog&utm_medium=next_steps&utm_campaign='+encodeURIComponent(pagePath);

    var section=document.createElement('div');
    section.className='mt-12';
    var heading=isZH?'下一步':'Next Steps';
    var html='<h2 class="text-2xl font-bold mb-5">'+heading+'</h2><div class="grid md:grid-cols-3 gap-4">';
    steps.forEach(function(s){
      html+='<a href="'+s.link+utm+'" data-blog-card class="block bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition">'+
        '<p class="text-2xl mb-2">'+s.icon+'</p>'+
        '<h3 class="text-base font-semibold text-gray-900 mb-1">'+s.title+'</h3>'+
        '<p class="text-sm text-gray-600">'+s.desc+'</p></a>';
    });
    html+='</div>';
    section.innerHTML=html;

    waitlistCTA.parentNode.insertBefore(section,waitlistCTA);
  }

  /* === Click tracking === */
  function initTracking(){
    document.addEventListener('click',function(e){
      var card=e.target.closest('[data-blog-card]');
      if(card){
        pushEvent('blog_card_click',{card_href:card.href||'',context:'post_page'});
      }
      var nav=e.target.closest('[data-blog-nav]');
      if(nav){
        pushEvent('blog_nav_click',{nav_href:nav.href||'',direction:nav.querySelector('.text-xs')?.textContent||''});
      }
      var cta=e.target.closest('.blog-inline-cta a');
      if(cta){
        pushEvent('blog_inline_cta_click',{cta_href:cta.href||''});
      }
    });
  }

  function init(){
    insertInlineCTAs();
    insertNextSteps();
    initTracking();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  } else {
    setTimeout(init,0);
  }
})();
