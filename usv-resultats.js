(function(){
  var MATCHS = window.USV_MATCHS || [];
  var CLUB = window.USV_CLUB || "US Valbonne";
  var ATTENTE = window.USV_ATTENTE || "";
  var LOGOS = window.USV_LOGOS || {};

  var root = document.getElementById("usvarch");
  if (!root) return;
  if (root.getAttribute("data-ok")) return;
  root.setAttribute("data-ok", "1");

  var J = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  var MO = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  var CATS = ["Tous","École de foot","Formation","Féminines","Seniors"];
  var filtre = "Tous";

  function $(id){ return document.getElementById(id); }
  function el(tag, cls, txt){ var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  function vider(e){ while (e.firstChild) e.removeChild(e.firstChild); }
  function D(s){ return new Date(s + "T12:00:00"); }
  function deux(n){ return ("0" + n).slice(-2); }
  function iso(d){ return d.getFullYear() + "-" + deux(d.getMonth() + 1) + "-" + deux(d.getDate()); }
  function cle(s){ var d = D(s); d.setDate(d.getDate() - ((d.getDay() + 1) % 7)); return iso(d); }
  function jn(d){ return d.getDate() === 1 ? "1er" : String(d.getDate()); }
  function libelle(k){
    var s = D(k), e = D(k); e.setDate(e.getDate() + 1);
    if (s.getMonth() === e.getMonth()) return jn(s) + " et " + jn(e) + " " + MO[e.getMonth()];
    return jn(s) + " " + MO[s.getMonth()] + " et " + jn(e) + " " + MO[e.getMonth()];
  }
  function cat(e){
    if (/F$/i.test(e)) return "Féminines";
    if (/senior/i.test(e)) return "Seniors";
    var m = e.match(/U(\d+)/i), n = m ? parseInt(m[1], 10) : 0;
    return (n > 0 ? (n > 11 ? "Formation" : "École de foot") : "Formation");
  }
  function res(m){ return m[4] > m[5] ? "v" : (m[5] > m[4] ? "d" : "n"); }
  function bil(l){ var b = {v:0,n:0,d:0}; l.forEach(function(m){ b[res(m)]++; }); return b; }

  var WE = {}, cles = [];
  MATCHS.forEach(function(m){ var k = cle(m[0]); if (!WE[k]) { WE[k] = []; cles.push(k); } WE[k].push(m); });
  var enAttente = (ATTENTE ? (!WE[ATTENTE] ? (cles.length ? ATTENTE > cles.slice().sort().reverse()[0] : true) : false) : false);
  if (enAttente) { WE[ATTENTE] = []; cles.push(ATTENTE); }
  cles.sort(); cles.reverse();
  var actuel = cles[0];

  function initiales(nom){
    var mots = nom.replace(/[^A-Za-zÀ-ÿ ]/g, " ").split(" ").filter(function(w){ return w.length > 1 ? ["de","du","la","le","les","des","et","sur","en"].indexOf(w.toLowerCase()) === -1 : false; });
    var t = mots.slice(0, 3).map(function(w){ return w.charAt(0).toUpperCase(); }).join("");
    return t || nom.slice(0, 2).toUpperCase();
  }
  function logo(nom, usv){
    var box = el("span", "a-logo" + (usv ? " usv" : ""));
    var url = LOGOS[nom];
    function rond(){ vider(box); box.classList.add("vide"); box.textContent = usv ? "USV" : initiales(nom); }
    if (url) { var i = el("img"); i.alt = nom; i.loading = "lazy"; i.onerror = rond; i.src = url; box.appendChild(i); } else rond();
    return box;
  }
  function equipe(nom, usv, cote){
    var w = el("span", "a-club " + cote);
    var n = el("span", usv ? "a-eq usv" : "a-eq", nom);
    if (cote === "a-dom") { w.appendChild(n); w.appendChild(logo(nom, usv)); } else { w.appendChild(logo(nom, usv)); w.appendChild(n); }
    return w;
  }

  function stat(nb, lib, c){ var s = el("div", "a-stat" + (c ? " " + c : "")); s.appendChild(el("b", "", String(nb))); s.appendChild(el("span", "", lib)); return s; }

  function rendre(liste, L){
      var jours = {}, oj = [];
      liste.forEach(function(m){ if (!jours[m[0]]) { jours[m[0]] = []; oj.push(m[0]); } jours[m[0]].push(m); });
      oj.sort();
      oj.forEach(function(d){
        var dt = D(d);
        L.appendChild(el("div", "a-jour", J[dt.getDay()] + " " + dt.getDate() + " " + MO[dt.getMonth()]));
        jours[d].forEach(function(m){
          var dom = (m[3] === "dom"), r = res(m);
          var ligne = el("div", "a-ligne");
          ligne.appendChild(el("span", "a-tag" + (cat(m[1]) === "Féminines" ? " f" : ""), m[1]));
          ligne.appendChild(equipe(dom ? CLUB : m[2], dom, "a-dom"));
          var sc = el("span", "a-score"); sc.appendChild(el("b", "", String(dom ? m[4] : m[5]))); sc.appendChild(el("b", "", String(dom ? m[5] : m[4]))); ligne.appendChild(sc);
          ligne.appendChild(equipe(dom ? m[2] : CLUB, !dom, "a-ext"));
          ligne.appendChild(el("span", "a-res " + r, r.toUpperCase()));
          L.appendChild(ligne);
        });
      });
  }

  function afficher(){
    $("usvarchTitre").textContent = actuel ? libelle(actuel) : "Aucun match";

    var attente = (enAttente ? actuel === ATTENTE : false);
    if (attente) root.classList.add("attente"); else root.classList.remove("attente");
    var liste = (WE[actuel] || []).filter(function(m){ return filtre === "Tous" ? true : cat(m[1]) === filtre; });
    var b = bil(liste), B = $("usvarchBilan"); vider(B);
    B.appendChild(stat(liste.length, "Matchs"));
    B.appendChild(stat(b.v, "Victoires", "v"));
    B.appendChild(stat(b.n, "Nuls", "n"));
    B.appendChild(stat(b.d, "Défaites", "d"));

    var L = $("usvarchListe"); vider(L);
    if (attente) {
      var bloc = el("div", "a-wait");
      var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 64 64"); svg.setAttribute("class", "a-ballon");
      [["circle",{cx:32,cy:32,r:29,fill:"#fff",stroke:"#0E1F4D","stroke-width":3}],
       ["polygon",{points:"32,20 43,28 39,41 25,41 21,28",fill:"#0E1F4D"}],
       ["path",{d:"M32 20V5M43 28l13-6M39 41l9 12M25 41l-9 12M21 28L8 22",stroke:"#0E1F4D","stroke-width":3,fill:"none"}]
      ].forEach(function(f){ var n = document.createElementNS(NS, f[0]); for (var a in f[1]) n.setAttribute(a, f[1][a]); svg.appendChild(n); });
      bloc.appendChild(svg);
      bloc.appendChild(el("strong", "", "Les résultats sont encore au vestiaire"));
      bloc.appendChild(el("p", "", "Le temps de ranger les crampons et de faire le point sur chaque match, les scores du week-end arrivent très vite. En attendant, retrouvez les week-ends précédents juste en dessous."));
      L.appendChild(bloc);
    } else if (!liste.length) L.appendChild(el("div", "a-vide", "Aucun match dans cette catégorie ce week-end."));
    rendre(liste, L);
    rail(); animer();
  }

  function rail(){
    var autres = cles.filter(function(k){ return k !== actuel ? !(enAttente ? k === ATTENTE : false) : false; });
    $("usvarchAussi").style.display = autres.length ? "" : "none";
    var R = $("usvarchRail"); vider(R);
    autres.forEach(function(k, i){
      var b = bil(WE[k]);
      var p = el("div", "a-panel" + (i === 0 ? " ouvert" : ""));
      var t = el("button", "a-ptete"); t.type = "button";
      var g = el("span", "a-pgauche");
      g.appendChild(el("small", "", "Week-end"));
      g.appendChild(el("strong", "", libelle(k)));
      t.appendChild(g);
      var mini = el("span", "a-mini");
      mini.appendChild(el("span", "a-nb", WE[k].length + " matchs"));
      [["v","V"],["n","N"],["d","D"]].forEach(function(x){ var s = el("span"); s.appendChild(el("b", x[0], String(b[x[0]]))); s.appendChild(document.createTextNode(x[1])); mini.appendChild(s); });
      var chev = el("span", "a-chev", "+");
      mini.appendChild(chev);
      t.appendChild(mini);
      var corps = el("div", "a-pcorps");
      rendre(WE[k], corps);
      t.onclick = function(){ if (p.classList.contains("ouvert")) p.classList.remove("ouvert"); else p.classList.add("ouvert"); };
      p.appendChild(t); p.appendChild(corps);
      R.appendChild(p);
    });
  }

  function filtres(){
    var F = $("usvarchFiltres"); vider(F);
    CATS.forEach(function(c){
      var bt = el("button", c === filtre ? "on" : "", c); bt.type = "button";
      bt.onclick = function(){ filtre = c; filtres(); afficher(); };
      F.appendChild(bt);
    });
  }


  function animer(){
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    var io = new IntersectionObserver(function(en){
      var n = 0;
      en.forEach(function(e){
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        e.target.style.setProperty("--d", (Math.min(n, 8) * 0.06) + "s"); n++;
        e.target.classList.remove("a-att"); e.target.classList.add("a-go");
      });
    }, {threshold: 0.1});
    Array.prototype.forEach.call($("usvarchHaut").querySelectorAll(".a-stat, .a-jour, .a-ligne, .a-wait"), function(it){
      it.classList.remove("a-go"); it.classList.add("a-att"); io.observe(it);
    });
  }

  filtres(); afficher();
})();
