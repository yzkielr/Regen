// The private Sites checkout supplies the operations UI. Article storage and
// its editor live on the storefront, so retain their hooks after regeneration.
function replaceHook(source, from, to) {
  if (!source.includes(from)) throw new Error('Article CMS: upstream navigation changed at ' + from)
  return source.replace(from, to)
}

export function withArticleNavigation(name, source) {
  if (name === 'module-catalog' && !source.includes("'article-write'")) {
    return replaceHook(replaceHook(source, "['config','Pusat Konfigurasi','sliders','integrasi']",
      "['articles','Daftar Artikel','list','artikel'],['article-write','Tulis Artikel','book','artikel'],['article-settings','Pengaturan Artikel','settings','artikel']"),
      "|'service'|'accounts';", "|'service'|'accounts'|'config';")
  }
  if (name !== 'operations-console' || source.includes("from './article-workspace'")) return source
  const hooks = [
    ['import OperationsPanel', "import ArticleWorkspace from './article-workspace';\nimport OperationsPanel"],
    ["integrasi:'LAYANAN & INTEGRASI'", "integrasi:'LAYANAN & INTEGRASI',artikel:'ARTIKEL'"],
    ["wanted==='accounts'||", "wanted==='config'||wanted==='accounts'||"],
    ["p==='accounts'||", "p==='config'||p==='accounts'||"],
    ['if(!canOpenAdminPage(role,p))return;setPage(p);', "if(!canOpenAdminPage(role,p))return;if(p!==page&&!window.dispatchEvent(new Event('regen:leave-article',{cancelable:true})))return;setPage(p);"],
    ["const title=page==='accounts'?", "const title=page==='config'?'Pusat Konfigurasi':page==='accounts'?"],
    ['</span></button></div>}{Object.entries(groups)', `</span></button>{'pusat konfigurasi'.includes(q.toLowerCase())&&<button className={page==='config'?'active':''} aria-current={page==='config'?'page':undefined} onClick={()=>navigate('config')}><SlidersHorizontal size={17}/><span>Pusat Konfigurasi</span></button>}</div>}{Object.entries(groups)`],
    ['!text.toLowerCase().includes(q.toLowerCase())', "!(String(index+1)+'. '+text.toLowerCase()).includes(q.toLowerCase())"],
    ['<div className="suite-content">{data?', `<div className="suite-content">{page==='articles'||page==='article-write'||page==='article-settings'?<ArticleWorkspace page={page} author={displayName} supervisor={canSupervise(role)} navigate={navigate}/>:data?`],
  ]
  return hooks.reduce((result,[from,to]) => replaceHook(result,from,to),source)
}
