export const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const fmt = (v,d=1) => v == null || !Number.isFinite(Number(v)) ? '—' : Number(v).toLocaleString('zh-TW',{minimumFractionDigits:d,maximumFractionDigits:d});
let sequence=0;
export function lineChart(series,{title,unit='',index=false}={}){
  const id=`chart-${++sequence}`, mobile=window.innerWidth<760;
  const W=mobile?Math.max(280,Math.min(window.innerWidth-76,560)):640,H=300;
  const margin={left:44,right:54,top:26,bottom:35};
  const values=series.flatMap(s=>s.points.map(p=>p.y)).filter(v=>v!=null&&Number.isFinite(v));
  if(!values.length)return '<div class="empty">此範圍沒有可比較的學校資料。缺值不視為零。</div>';
  const rawmax=Math.max(...values,1)*1.15,power=10**Math.floor(Math.log10(rawmax));
  const ymax=Math.ceil(rawmax/power*2)/2*power;
  const x=v=>margin.left+(v-104)/10*(W-margin.left-margin.right),y=v=>H-margin.bottom-v/ymax*(H-margin.top-margin.bottom);
  let svg=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">104至114學年度。${series.map(s=>s.name).join('、')}。縱軸${esc(unit)}，從零起算。完整數值可在下方表格或資料下載取得。</desc>`;
  for(let i=0;i<=4;i++){const v=ymax*i/4;svg+=`<line x1="${margin.left}" x2="${W-margin.right}" y1="${y(v)}" y2="${y(v)}" stroke="#e5ece6"/><text x="${margin.left-8}" y="${y(v)+4}" text-anchor="end" font-size="10">${v>=1000?`${fmt(v/1000,1)}k`:fmt(v,v<10?1:0)}</text>`;}
  svg+=`<text x="${margin.left}" y="13" font-size="10">${esc(unit)}</text>`;
  for(let yr=104;yr<=114;yr+=2)svg+=`<text x="${x(yr)}" y="${H-12}" text-anchor="middle" font-size="10">${yr}</text>`;
  if(index)svg+=`<line x1="${x(104)}" x2="${x(114)}" y1="${y(100)}" y2="${y(100)}" stroke="#8e9c95" stroke-dasharray="3 5"/>`;
  const endings=[];
  series.forEach(s=>{let d='',open=false;s.points.forEach(p=>{if(p.y==null||!Number.isFinite(p.y)){open=false;return;}d+=`${open?'L':'M'}${x(p.x)},${y(p.y)} `;open=true;});svg+=`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.7" ${s.dashed?'stroke-dasharray="6 5"':''}/>`;
    s.points.filter(p=>p.y!=null).forEach(p=>{svg+=`<circle cx="${x(p.x)}" cy="${y(p.y)}" r="3" fill="white" stroke="${s.color}" stroke-width="1.6"/>`;});
    const last=s.points.find(p=>p.x===114&&p.y!=null);if(last)endings.push({s,v:last.y,pos:y(last.y)});
  });
  endings.sort((a,b)=>a.pos-b.pos);for(let i=1;i<endings.length;i++)endings[i].pos=Math.max(endings[i].pos,endings[i-1].pos+18);
  endings.forEach(({s,v,pos})=>{svg+=`<line x1="${x(114)+5}" x2="${x(114)+10}" y1="${y(v)}" y2="${pos}" stroke="${s.color}"/><text x="${x(114)+13}" y="${pos+4}" style="fill:${s.color};font-weight:600" font-size="11">${v>=10000?`${fmt(v/10000,1)}萬`:fmt(v,1)}</text>`;});
  for(let yr=104;yr<=114;yr++){const tip=`${yr}學年 · ${series.map(s=>`${s.name} ${fmt(s.points.find(p=>p.x===yr)?.y)}${unit}`).join(' ／ ')}`;svg+=`<rect class="chart-hit" x="${x(yr)-Math.min(20,(W-margin.left-margin.right)/22)}" y="${margin.top}" width="${Math.min(40,(W-margin.left-margin.right)/11)}" height="${H-margin.top-margin.bottom}" fill="transparent" data-tip="${esc(tip)}"><title>${esc(tip)}</title></rect>`;}
  return `<div class="chart-wrap">${svg}</svg><div class="chart-tooltip" aria-live="polite">移至圖表查看各年數值 · 下方提供完整表格</div></div>`;
}
export function bars(items,max,unit=''){
  return items.map((r,i)=>`<div class="bar-item"><div class="bar-label"><span>${esc(r.label)}</span><strong>${fmt(r.value,0)}${unit}</strong></div><div class="bar-track"><div class="bar-fill ${i%2?'blue':''}" style="width:${r.value/max*100}%"></div></div></div>`).join('');
}
