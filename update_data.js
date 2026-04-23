const fs = require('fs');
let c = fs.readFileSync('site_data.js', 'utf8');
c = c.replace(/BestPVAShop/g, 'RealPVAShop')
     .replace(/bestpvashop/g, 'realpvashop')
     .replace(/Best PVA Shop/g, 'Real PVA Shop')
     .replace(/BestPVAShops/g, 'RealPVAShops');
c = c.replace(/"themeColor"\s*:\s*"#[a-fA-F0-9]+"/, '"themeColor": "#FFFFFF"');
c = c.replace(/bg-\[#1E293B\]/g, 'bg-gray-100')
     .replace(/bg-\[#0F172A\]/g, 'bg-gray-50')
     .replace(/bg-\[#0B1120\]/g, 'bg-white')
     .replace(/text-white/g, 'text-gray-900')
     .replace(/text-slate-300/g, 'text-gray-600')
     .replace(/text-slate-400/g, 'text-gray-500')
     .replace(/text-slate-200/g, 'text-gray-700')
     .replace(/border-white\/5/g, 'border-gray-200')
     .replace(/border-white\/10/g, 'border-gray-200');
fs.writeFileSync('site_data.js', c);
console.log('Successfully updated site_data.js');
