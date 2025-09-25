import http from 'http';
import fs from 'fs/promises';

import * as data from './data.js';


async function homeView() {
   const html = await readFile('./src/views/home/index.html');
   const cats = await data.getCats();

   let catsHtml = '';
   if (cats.length > 0) {
      catsHtml = cats.map(cat => catTemplate(cat)).join('\n');
   } else {
      catsHtml = '<span>There are no cats!</span>';
   }

   const result = html.replaceAll('{{cats}}', catsHtml);

   return result;
}

async function addBreedView() {
   const html = await readFile('./src/views/addBreed.html');
   return html;
}

async function addCatView() {
   const html = await readFile('./src/views/addCat.html');
   return html;
}

function readFile(path) {
   return fs.readFile(path, { encoding: 'utf-8' });
}

async function editCatView(catId) {
   const cat = await data.getCat(catId);

   let html = await readFile('./src/views/editCat.html');

   html = html.replaceAll('{{name}}', cat.name);
   html = html.replaceAll('{{description}}', cat.description);
   html = html.replaceAll('{{imageUrl}}', cat.imageUrl);

   return html;
}

function catTemplate(cat) {
   return `
   <li>
       <img src="${cat.imageUrl}" alt="${cat.name}">
       <h3>${cat.name}</h3>
       <p><span>Breed: </span>${cat.breed}</p>
       <p><span>Description: </span>${cat.description}</p>
       <ul class="buttons">
           <li class="btn edit"><a href="/cats/edit-cat/${cat.id}">Change Info</a></li>
           <li class="btn delete"><a href="">New Home</a></li>
       </ul>
   </li>
`;
}

const server = http.createServer(async (req, res) => {
   let html;

   if (req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
         body += chunk.toString();
      });

      req.on('end', async () => {
         const searchParams = new URLSearchParams(body);
         const catResult = Object.fromEntries(searchParams.entries());

         if (req.url === '/cats/add-cat') {
            data.saveCat(catResult);
         } else if (req.url.startsWith('/cats/add-cat')) {
            const segments = req.url.split('/');
            const catId = Number(segments[3]);

            await data.editCat(catId, catResult)
         }


         // Redirect to home page
         res.writeHead(302, {
            'location': '/'
         });

         res.end();
      });

      return;
   }

   if (req.url.startsWith('/cats/edit-cat')) {
      const segments = req.url.split('/');
      const catId = Number(segments[3]);

      html = await editCatView(catId);

   } else {
      switch (req.url) {
         case '/':
            html = await homeView();
            break;

         case '/cats/add-breed':
            html = await addBreedView();
            break;

         case '/cats/add-cat':
            html = await addCatView();
            break;

         case '/styles/site.css':
            const siteCss = await readFile('./src/content/styles/site.css');

            res.writeHead(200, {
               'content-type': 'text/css',
               // Css time for cache memory. - 10 sec.
               'cache-control': 'max-age=10'
            });
            res.write(siteCss);
            res.end();
            return;

         default:
            return res.end();
      }
   }

   res.writeHead(200, {
      'content-type': 'text/html'
   });

   res.write(html);
   res.end();
});

server.listen(5000);

console.log('Server is listening on http://localhost:5000...');
