import http from 'http';
import fs from 'fs/promises';

async function homeView() {
   const homeHtml = await renderView('./src/views/home/index.html');
   return homeHtml;
}

async function addBreedView() {
   const html = await renderView('./src/views/addBreed.html');
   return html;
}

async function addCatView() {
   const html = await renderView('./src/views/addCat.html');
   return html;
}

function renderView(path) {
   return fs.readFile(path, { encoding: 'utf-8' });
}


const server = http.createServer(async (req, res) => {
   let html;

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
         const siteCss = await fs.readFile('./src/content/styles/site.css', { encoding: 'utf-8' });

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
