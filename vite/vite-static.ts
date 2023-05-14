import { promises as fs } from 'fs'
import path, { dirname } from "path";
import { PluginOption, ViteDevServer } from "vite";
import mime from 'mime'

const tryFile = async (res, tryoutPath: string) => {
  try {
    const stat = await fs.lstat(tryoutPath);

    if (stat.isFile()) {
      res.setHeader('Content-type', mime.getType(tryoutPath))
      res.setHeader('Cache-Control', 'max-age=31536000, immutable')
      res.writeHead(200);
      res.write(await fs.readFile(tryoutPath));
      res.end();
      return true
    }    
  }
  catch {}
  return false
}

export default function DynamicPublicDirectory(assetPaths: { [key: string]: string }): PluginOption {
  return {
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          let foundMatch = false
          const cleanedUrl = req.originalUrl.split('?')[0]

          for (const [assetPath, outputPath] of Object.entries(assetPaths)) {
            let tryoutPath = path.join(__dirname.replace('/vite', ''), assetPath, cleanedUrl);
            if (outputPath.length > 1) tryoutPath = tryoutPath.replace(outputPath, '/') 
            if (tryoutPath.at(-1) === '/') tryoutPath += 'index.html'
            const foundFile = await tryFile(res, tryoutPath)
            if (foundFile) {
              foundMatch = true
            }
          }

          if (!foundMatch) {
            let tryoutPath = path.join(__dirname.replace('/vite', ''), '/frontend/html/index.html');
            await tryFile(res, tryoutPath)
          }

          next();
        });
      };
    },
    name: 'dynamic assets',
  };
}

