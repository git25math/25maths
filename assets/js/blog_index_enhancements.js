(function(){
  'use strict';

  function init(){
    var cards=document.querySelectorAll('.blog-index-card');
    var filterBtns=document.querySelectorAll('.blog-filter-btn');
    var searchInput=document.getElementById('blog-search-input');
    var sortSelect=document.getElementById('blog-sort-select');
    var cardGrid=document.querySelector('.blog-card-grid');

    if(!cards.length) return;

    var activeCategory='all';
    var searchTerm='';

    function filterCards(){
      cards.forEach(function(card){
        var catMatch=activeCategory==='all'||card.getAttribute('data-category')===activeCategory;
        var title=(card.getAttribute('data-title')||'').toLowerCase();
        var searchMatch=!searchTerm||title.indexOf(searchTerm)!==-1;
        card.setAttribute('data-hidden',!(catMatch&&searchMatch)?'true':'false');
      });
      pushEvent('blog_filter',{category:activeCategory,search:searchTerm});
    }

    function sortCards(){
      if(!cardGrid||!sortSelect) return;
      var sortBy=sortSelect.value;
      var arr=Array.from(cards);
      arr.sort(function(a,b){
        if(sortBy==='newest'){
          return (b.getAttribute('data-date')||'').localeCompare(a.getAttribute('data-date')||'');
        } else if(sortBy==='shortest'){
          return parseInt(a.getAttribute('data-read-time')||'99',10)-parseInt(b.getAttribute('data-read-time')||'99',10);
        }
        return 0;
      });
      arr.forEach(function(card){cardGrid.appendChild(card);});
      pushEvent('blog_sort',{sort_by:sortBy});
    }

    // Filter button clicks
    filterBtns.forEach(function(btn){
      btn.addEventListener('click',function(){
        filterBtns.forEach(function(b){b.classList.remove('active');});
        btn.classList.add('active');
        activeCategory=btn.getAttribute('data-filter')||'all';
        filterCards();
      });
    });

    // Search input
    if(searchInput){
      var debounce;
      searchInput.addEventListener('input',function(){
        clearTimeout(debounce);
        debounce=setTimeout(function(){
          searchTerm=searchInput.value.trim().toLowerCase();
          filterCards();
        },200);
      });
    }

    // Sort select
    if(sortSelect){
      sortSelect.addEventListener('change',function(){
        sortCards();
      });
    }

    // Track card clicks
    cards.forEach(function(card){
      card.addEventListener('click',function(){
        pushEvent('blog_card_click',{title:card.getAttribute('data-title'),category:card.getAttribute('data-category')});
      });
    });
  }

  function pushEvent(event,data){
    try{
      window.dataLayer=window.dataLayer||[];
      var payload={event:event,page_path:window.location.pathname};
      if(data){for(var k in data){if(data.hasOwnProperty(k))payload[k]=data[k];}}
      window.dataLayer.push(payload);
    }catch(e){/* silent */}
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  } else {
    setTimeout(init,0);
  }
})();
