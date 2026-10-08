// Copy the existing admin client into the storefront without copying server code or data.
// Run locally after changing the Site client; generated files are checked into the storefront.
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
const root=process.cwd(), source=path.join(root,'sites/regen-inbox'), target=path.join(root,'app/admin');
const ui=['operations-console','operations-panels','operations-components','service-console','knowledge-importer','whatsapp-test-sync','whatsapp-cs-panel','dashboard','admin-panels'];
const libs=['operations','module-catalog','regen-phone','service','service-types','knowledge','whatsapp-test','whatsapp-cs','flip','document-extract','admin','types'];
fs.mkdirSync(path.join(target,'ui'),{recursive:true});fs.mkdirSync(path.join(target,'lib'),{recursive:true});fs.mkdirSync(path.join(root,'public/admin-assets'),{recursive:true});
for(const name of libs){const data=fs.readFileSync(path.join(source,`lib/${name}.ts`),'utf8').replace(/(from\s+['"]\.\.?\/[^'"]+)\.ts(['"])/g,'$1$2').replaceAll("import('pdfjs-dist/","import('pdfjs-dist-admin/").replaceAll('/pdf.worker.min.mjs','/admin-assets/pdf.worker.min.mjs').replaceAll('/pdf-assets/','/admin-assets/pdf-assets/');fs.writeFileSync(path.join(target,`lib/${name}.ts`),data);}
for(const name of ui){
 let data=fs.readFileSync(path.join(source,`app/${name}.tsx`),'utf8');
 data=data.replaceAll('/api/','/admin/api/').replaceAll('/regen-logo-green.png','/admin-assets/regen-logo-green.png').replaceAll('/regen-logo-white.png','/admin-assets/regen-logo-white.png');
 data=data.replaceAll('/signin-with-chatgpt?return_to=%2F','/admin/login');
 data=data.replaceAll('href="/#','href="/admin#');
 data=data.replaceAll('href="/admin-access"','href="https://regen-inbox.hello-wearology.chatgpt.site/admin-access"');
 data=data.replace(/<a[^>]*href="\/signout-with-chatgpt\?return_to=%2F"[^>]*>([\s\S]*?)<\/a>/g,'<button type="button" onClick={()=>void logoutAdmin()} aria-label="Keluar">$1</button>');
 data=data.replace(/\bfetch\(/g,'adminFetch(');
 data=data.replaceAll("import('pdfjs-dist/","import('pdfjs-dist-admin/").replaceAll('/pdf.worker.min.mjs','/admin-assets/pdf.worker.min.mjs');
 data=data.replaceAll('Maksimal 10 MB per file.','Maksimal 4 MB per file melalui domain admin.');
 data=data.replaceAll('Simpan file asli secara privat di Media Library','Simpan file asli secara privat di Media Library (maks. 4 MB)');
 data=data.replaceAll('if(keepFile&&!originalId){','if(keepFile&&!originalId){if(preview.file.size>3900000)throw Error("File asli maksimal 3,9 MB melalui domain admin. Nonaktifkan penyimpanan file asli untuk menyimpan teks saja.");');
 data=data.replaceAll('Memberi akses login dilakukan melalui pengaturan berbagi Site.','Username dan password dashboard dikelola pemilik melalui Kelola login admin.');
 const imports=[];if(data.includes('adminFetch('))imports.push('adminFetch');if(data.includes('logoutAdmin('))imports.push('logoutAdmin');
 if(imports.length)data=data.replace(/(['"]use client['"];?)/,`$1\nimport { ${imports.join(', ')} } from './admin-client';`);
 fs.writeFileSync(path.join(target,`ui/${name}.tsx`),data);
}
const styles=['globals','admin','comfortable','live','operations','service','knowledge'];
let css='/* Generated from the existing Regen Admin styles; scoped to /admin. */\n';
for(const name of styles){const tree=postcss.parse(fs.readFileSync(path.join(source,`app/${name}.css`),'utf8'));tree.walkAtRules('import',r=>r.remove());tree.walkRules(rule=>{if(rule.parent?.type==='atrule'&&/keyframes$/.test(rule.parent.name))return;rule.selectors=rule.selectors.map(selector=>{if(selector.includes(':root'))return selector.replaceAll(':root','.regen-admin');if(/^(html|body)(?=[\s.:#\[]|$)/.test(selector))return selector.replace(/^(html|body)/,'.regen-admin');return `.regen-admin ${selector}`;});});css+=tree.toString()+'\n';}
fs.writeFileSync(path.join(target,'admin-ui.css'),css.trimEnd()+'\n');
for(const file of ['regen-logo-green.png','regen-logo-white.png'])fs.copyFileSync(path.join(source,'public',file),path.join(root,'public/admin-assets',file));
const pdf=path.join(source,'node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs');
fs.copyFileSync(pdf,path.join(root,'public/admin-assets/pdf.worker.min.mjs'));
fs.cpSync(path.join(source,'public/pdf-assets'),path.join(root,'public/admin-assets/pdf-assets'),{recursive:true});
console.log(`Copied ${ui.length} UI modules and ${libs.length} shared client libraries; no server state or secrets copied.`);
