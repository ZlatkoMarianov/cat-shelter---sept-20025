import http from 'http';
import fs from 'fs/promises';

import cats from './cats.js';

async function homeView() {
   const html = await readFile('./src/views/home/index.html');
   const catsHtml = cats.map(cat => catTemplate(cat)).join('\n');
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

function catTemplate(cat) {
   return `
   <li>
       <img src="${cat.imageUrl}" alt="${cat.name}">
       <h3>${cat.name}</h3>
       <p><span>Breed: </span>${cat.breed}</p>
       <p><span>Description: </span>${cat.description}</p>
       <ul class="buttons">
           <li class="btn edit"><a href="">Change Info</a></li>
           <li class="btn delete"><a href="">New Home</a></li>
       </ul>
   </li>
`;
}


const server = http.createServer(async (req, res) => {
   let html;

   if (req.method === 'POST') {
      let data = '';

      req.on('data', (chunk) => {
         data += chunk.toString();
      });

      req.on('end', () => {
         const result = new URLSearchParams(data);
         const newCat = Object.fromEntries(result.entries());

         cats.push(newCat)

         //TODO : Redirect to home page
      });
   }

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
         });
         res.write(siteCss);
         res.end();
         return;

      default:
         return res.end();
   }

   res.writeHead(200, {
      'content-type': 'text/html'
   });

   res.write(html);
   res.end();
});

server.listen(5000);

console.log('Server is listening on http://localhost:5000...');
